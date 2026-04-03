package com.soaengry.geekyard.domain.user.service;

import com.soaengry.geekyard.domain.user.dto.request.*;
import com.soaengry.geekyard.domain.user.dto.response.MyProfileResponse;
import com.soaengry.geekyard.domain.user.dto.response.TokenResponse;
import com.soaengry.geekyard.domain.user.dto.response.UserProfileResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.exception.UserErrorCode;
import com.soaengry.geekyard.domain.user.exception.UserException;
import com.soaengry.geekyard.domain.user.repository.UserRepository;
import com.soaengry.geekyard.global.security.jwt.JwtProvider;
import com.soaengry.geekyard.global.service.RedisService;
import com.soaengry.geekyard.global.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    @Value("${jwt.refresh-token-expiration:P7D}")
    private Duration refreshTokenTtl;

    @Value("${app.security.account-recovery-days:30}")
    private int accountRecoveryDays;

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final RedisService redisService;
    private final S3Service s3Service;

    public TokenResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new UserException(UserErrorCode.DUPLICATE_EMAIL);
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new UserException(UserErrorCode.DUPLICATE_USERNAME);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.create(request.email(), request.username(), request.nickname(), encodedPassword);
        userRepository.save(user);

        return issueTokens(user);
    }

    public TokenResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UserException(UserErrorCode.AUTH_INVALID_CREDENTIALS));

        if (user.getDeletedAt() != null) {
            throw new UserException(UserErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        if (user.getAuthProvider() != null) {
            throw new UserException(UserErrorCode.OAUTH_ACCOUNT);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("[SECURITY] 로그인 실패 - 비밀번호 불일치: userId={}", user.getId());
            throw new UserException(UserErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        log.info("[SECURITY] 로그인 성공: userId={}", user.getId());
        return issueTokens(user);
    }

    public void logout(User user, String refreshToken) {
        redisService.deleteRefreshToken(user.getId(), refreshToken);
        log.info("[SECURITY] 로그아웃: userId={}", user.getId());
    }

    @Transactional
    public TokenResponse refresh(String rawRefreshToken) {
        if (!jwtProvider.validate(rawRefreshToken)) {
            log.warn("[SECURITY] 토큰 갱신 실패 - 유효하지 않은 RefreshToken");
            throw new UserException(UserErrorCode.AUTH_INVALID_TOKEN);
        }

        Long userId = jwtProvider.getUserId(rawRefreshToken);
        int tokenVersion = jwtProvider.getTokenVersion(rawRefreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (user.getTokenVersion() != tokenVersion) {
            log.warn("[SECURITY] 토큰 갱신 실패 - 만료된 토큰 버전: userId={}", userId);
            throw new UserException(UserErrorCode.AUTH_TOKEN_EXPIRED);
        }

        if (!redisService.validateRefreshToken(userId, rawRefreshToken)) {
            log.warn("[SECURITY] 토큰 갱신 실패 - Redis에 없는 토큰: userId={}", userId);
            throw new UserException(UserErrorCode.AUTH_INVALID_TOKEN);
        }

        // 기존 RefreshToken 삭제 후 재발급 (Refresh Token Rotation)
        redisService.deleteRefreshToken(userId, rawRefreshToken);

        String newAccessToken = jwtProvider.generateAccessToken(userId, user.getTokenVersion());
        String newRefreshToken = jwtProvider.generateRefreshToken(userId, user.getTokenVersion());
        redisService.saveRefreshToken(userId, newRefreshToken, refreshTokenTtl);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), managed.getPassword())) {
            log.warn("[SECURITY] 비밀번호 변경 실패 - 현재 비밀번호 불일치: userId={}", managed.getId());
            throw new UserException(UserErrorCode.INVALID_PASSWORD);
        }

        managed.changePassword(passwordEncoder.encode(request.newPassword()));
        redisService.deleteAllRefreshTokens(managed.getId());
        log.info("[SECURITY] 비밀번호 변경 완료 - 전체 토큰 무효화: userId={}", managed.getId());
    }

    @Transactional(readOnly = true)
    public MyProfileResponse getMyProfile(User user) {
        return MyProfileResponse.from(user);
    }

    public MyProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
        managed.update(request.nickname(), request.bio());
        return MyProfileResponse.from(managed);
    }

    public MyProfileResponse updateProfileImage(User user, MultipartFile file) throws IOException {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        String oldImageUrl = managed.getProfileImage();
        String newImageUrl = s3Service.upload(file, managed.getId());
        managed.updateProfileImage(newImageUrl);

        if (oldImageUrl != null) {
            s3Service.delete(oldImageUrl);
        }

        return MyProfileResponse.from(managed);
    }

    public void deleteAccount(User user) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
        managed.softDelete();
        redisService.deleteAllRefreshTokens(managed.getId());
        log.info("[SECURITY] 계정 탈퇴(Soft Delete) - 전체 토큰 무효화: userId={}", managed.getId());
    }

    public void recoverAccount(RecoverAccountRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNotNull(request.email())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        LocalDateTime cutoff = LocalDateTime.now().minusDays(accountRecoveryDays);
        if (user.getDeletedAt().isBefore(cutoff)) {
            throw new UserException(UserErrorCode.ACCOUNT_RECOVERY_PERIOD_EXPIRED);
        }

        // User Enumeration 방지: 비밀번호 불일치와 계정 없음을 동일한 오류로 처리
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("[SECURITY] 계정 복구 실패 - 비밀번호 불일치: email={}", request.email());
            throw new UserException(UserErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        user.restore();
        log.info("[SECURITY] 계정 복구 성공: userId={}", user.getId());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (user.getDeletedAt() != null) {
            throw new UserException(UserErrorCode.USER_NOT_FOUND);
        }

        return UserProfileResponse.from(user);
    }

    private TokenResponse issueTokens(User user) {
        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getTokenVersion());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId(), user.getTokenVersion());
        redisService.saveRefreshToken(user.getId(), refreshToken, refreshTokenTtl);
        return new TokenResponse(accessToken, refreshToken);
    }
}
