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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);
    private static final int ACCOUNT_RECOVERY_DAYS = 30;

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
            throw new UserException(UserErrorCode.AUTH_INVALID_CREDENTIALS);
        }

        return issueTokens(user);
    }

    public void logout(User user, String refreshToken) {
        redisService.deleteRefreshToken(user.getId(), refreshToken);
    }

    @Transactional(readOnly = true)
    public TokenResponse refresh(String rawRefreshToken) {
        if (!jwtProvider.validate(rawRefreshToken)) {
            throw new UserException(UserErrorCode.AUTH_INVALID_TOKEN);
        }

        Long userId = jwtProvider.getUserId(rawRefreshToken);
        int tokenVersion = jwtProvider.getTokenVersion(rawRefreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (user.getTokenVersion() != tokenVersion) {
            throw new UserException(UserErrorCode.AUTH_TOKEN_EXPIRED);
        }

        if (!redisService.validateRefreshToken(userId, rawRefreshToken)) {
            throw new UserException(UserErrorCode.AUTH_INVALID_TOKEN);
        }

        // 기존 RefreshToken 삭제 후 재발급 (Refresh Token Rotation)
        redisService.deleteRefreshToken(userId, rawRefreshToken);

        String newAccessToken = jwtProvider.generateAccessToken(userId, user.getTokenVersion());
        String newRefreshToken = jwtProvider.generateRefreshToken(userId, user.getTokenVersion());
        redisService.saveRefreshToken(userId, newRefreshToken, REFRESH_TOKEN_TTL);

        return new TokenResponse(newAccessToken, newRefreshToken);
    }

    public void changePassword(User user, ChangePasswordRequest request) {
        User managed = userRepository.findById(user.getId())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.currentPassword(), managed.getPassword())) {
            throw new UserException(UserErrorCode.INVALID_PASSWORD);
        }

        managed.changePassword(passwordEncoder.encode(request.newPassword()));
        redisService.deleteAllRefreshTokens(managed.getId());
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
    }

    public void recoverAccount(RecoverAccountRequest request) {
        User user = userRepository.findByEmailAndDeletedAtIsNotNull(request.email())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        LocalDateTime cutoff = LocalDateTime.now().minusDays(ACCOUNT_RECOVERY_DAYS);
        if (user.getDeletedAt().isBefore(cutoff)) {
            throw new UserException(UserErrorCode.ACCOUNT_RECOVERY_PERIOD_EXPIRED);
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UserException(UserErrorCode.INVALID_PASSWORD);
        }

        user.restore();
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
        redisService.saveRefreshToken(user.getId(), refreshToken, REFRESH_TOKEN_TTL);
        return new TokenResponse(accessToken, refreshToken);
    }
}
