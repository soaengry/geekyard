package com.soaengry.geekyard.domain.user;

import com.soaengry.geekyard.domain.user.dto.request.*;
import com.soaengry.geekyard.domain.user.dto.response.MyProfileResponse;
import com.soaengry.geekyard.domain.user.dto.response.TokenResponse;
import com.soaengry.geekyard.domain.user.dto.response.UserProfileResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.exception.UserErrorCode;
import com.soaengry.geekyard.domain.user.exception.UserException;
import com.soaengry.geekyard.domain.user.repository.UserRepository;
import com.soaengry.geekyard.domain.user.service.UserService;
import com.soaengry.geekyard.global.config.TestRedisConfig;
import com.soaengry.geekyard.global.service.RedisService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Import(TestRedisConfig.class)
class UserServiceTest {

    @MockitoBean
    RedisConnectionFactory redisConnectionFactory;

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @MockitoBean
    RedisService redisService;

    private void setupRedisDefaults() {
        given(redisService.saveRefreshToken(anyLong(), anyString(), any(Duration.class))).willReturn("device-id");
        given(redisService.validateRefreshToken(anyLong(), anyString())).willReturn(true);
        willDoNothing().given(redisService).deleteRefreshToken(anyLong(), anyString());
        willDoNothing().given(redisService).deleteAllRefreshTokens(anyLong());
    }

    // ── 회원가입 ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("회원가입 성공 - 토큰 반환")
    void signup_success() {
        setupRedisDefaults();
        SignupRequest request = new SignupRequest("test@example.com", "password123", "테스터", "tester01");

        TokenResponse tokens = userService.signup(request);

        assertThat(tokens.accessToken()).isNotBlank();
        assertThat(tokens.refreshToken()).isNotBlank();
        assertThat(userRepository.existsByEmail("test@example.com")).isTrue();
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 이메일")
    void signup_duplicateEmail() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("dup@example.com", "password123", "유저1", "user001"));

        assertThatThrownBy(() ->
                userService.signup(new SignupRequest("dup@example.com", "password123", "유저2", "user002"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.DUPLICATE_EMAIL));
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 사용자명")
    void signup_duplicateUsername() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("a@example.com", "password123", "유저1", "sameuser"));

        assertThatThrownBy(() ->
                userService.signup(new SignupRequest("b@example.com", "password123", "유저2", "sameuser"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.DUPLICATE_USERNAME));
    }

    // ── 로그인 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("로그인 성공 - 토큰 반환")
    void login_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("login@example.com", "password123", "로그인유저", "loginuser"));

        TokenResponse tokens = userService.login(new LoginRequest("login@example.com", "password123"));

        assertThat(tokens.accessToken()).isNotBlank();
        assertThat(tokens.refreshToken()).isNotBlank();
    }

    @Test
    @DisplayName("로그인 실패 - 잘못된 비밀번호")
    void login_wrongPassword() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("wrong@example.com", "password123", "유저", "wronguser"));

        assertThatThrownBy(() ->
                userService.login(new LoginRequest("wrong@example.com", "wrongpassword"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.AUTH_INVALID_CREDENTIALS));
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void login_emailNotFound() {
        assertThatThrownBy(() ->
                userService.login(new LoginRequest("none@example.com", "password123"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.AUTH_INVALID_CREDENTIALS));
    }

    // ── 프로필 ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("내 프로필 조회 성공")
    void getMyProfile_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("me@example.com", "password123", "내유저", "meuser"));
        User user = userRepository.findByEmail("me@example.com").orElseThrow();

        MyProfileResponse profile = userService.getMyProfile(user);

        assertThat(profile.email()).isEqualTo("me@example.com");
        assertThat(profile.username()).isEqualTo("meuser");
        assertThat(profile.nickname()).isEqualTo("내유저");
    }

    @Test
    @DisplayName("프로필 수정 성공")
    void updateProfile_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("update@example.com", "password123", "수정전", "updateuser"));
        User user = userRepository.findByEmail("update@example.com").orElseThrow();

        MyProfileResponse updated = userService.updateProfile(user, new UpdateProfileRequest("수정후", "바이오"));

        assertThat(updated.nickname()).isEqualTo("수정후");
        assertThat(updated.bio()).isEqualTo("바이오");
    }

    // ── 타 유저 프로필 ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("타 유저 공개 프로필 조회 성공")
    void getUserProfile_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("pub@example.com", "password123", "공개유저", "publicuser"));

        UserProfileResponse profile = userService.getUserProfile("publicuser");

        assertThat(profile.username()).isEqualTo("publicuser");
        assertThat(profile.nickname()).isEqualTo("공개유저");
    }

    @Test
    @DisplayName("타 유저 프로필 조회 실패 - 존재하지 않는 username")
    void getUserProfile_notFound() {
        assertThatThrownBy(() -> userService.getUserProfile("nonexistent"))
                .isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.USER_NOT_FOUND));
    }

    // ── 비밀번호 변경 ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("비밀번호 변경 성공 - tokenVersion 증가")
    void changePassword_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("pw@example.com", "password123", "비번유저", "pwuser"));
        User user = userRepository.findByEmail("pw@example.com").orElseThrow();
        int originalVersion = user.getTokenVersion();

        userService.changePassword(user, new ChangePasswordRequest("password123", "newpassword123"));

        assertThat(user.getTokenVersion()).isEqualTo(originalVersion + 1);
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 현재 비밀번호 불일치")
    void changePassword_wrongCurrentPassword() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("pw2@example.com", "password123", "비번유저2", "pwuser2"));
        User user = userRepository.findByEmail("pw2@example.com").orElseThrow();

        assertThatThrownBy(() ->
                userService.changePassword(user, new ChangePasswordRequest("wrongpassword", "newpassword123"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.INVALID_PASSWORD));
    }

    // ── 탈퇴 & 복구 ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("회원 탈퇴 성공 - deletedAt 설정")
    void deleteAccount_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("del@example.com", "password123", "탈퇴유저", "deluser"));
        User user = userRepository.findByEmail("del@example.com").orElseThrow();

        userService.deleteAccount(user);

        assertThat(user.getDeletedAt()).isNotNull();
    }

    @Test
    @DisplayName("계정 복구 성공")
    void recoverAccount_success() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("recover@example.com", "password123", "복구유저", "recoveruser"));
        User user = userRepository.findByEmail("recover@example.com").orElseThrow();
        userService.deleteAccount(user);

        userService.recoverAccount(new RecoverAccountRequest("recover@example.com", "password123"));

        assertThat(user.getDeletedAt()).isNull();
    }

    @Test
    @DisplayName("계정 복구 실패 - 잘못된 비밀번호")
    void recoverAccount_wrongPassword() {
        setupRedisDefaults();
        userService.signup(new SignupRequest("recover2@example.com", "password123", "복구유저2", "recoveruser2"));
        User user = userRepository.findByEmail("recover2@example.com").orElseThrow();
        userService.deleteAccount(user);

        assertThatThrownBy(() ->
                userService.recoverAccount(new RecoverAccountRequest("recover2@example.com", "wrongpassword"))
        ).isInstanceOf(UserException.class)
                .satisfies(e -> assertThat(((UserException) e).getErrorCode()).isEqualTo(UserErrorCode.INVALID_PASSWORD));
    }
}
