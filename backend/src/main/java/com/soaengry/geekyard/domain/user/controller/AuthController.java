package com.soaengry.geekyard.domain.user.controller;

import com.soaengry.geekyard.domain.user.dto.request.ChangePasswordRequest;
import com.soaengry.geekyard.domain.user.dto.request.LoginRequest;
import com.soaengry.geekyard.domain.user.dto.request.SignupRequest;
import com.soaengry.geekyard.domain.user.dto.response.TokenResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.exception.UserErrorCode;
import com.soaengry.geekyard.domain.user.exception.UserException;
import com.soaengry.geekyard.domain.user.service.EmailVerificationService;
import com.soaengry.geekyard.domain.user.service.UserService;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<TokenResponse>> signup(@Valid @RequestBody SignupRequest request) {
        TokenResponse tokens = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(SuccessCode.SIGNUP, tokens));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse tokens = userService.login(request);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.LOGIN, tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal User user,
            @RequestHeader("X-Refresh-Token") String refreshToken
    ) {
        userService.logout(user, refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.LOGOUT));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @RequestHeader("X-Refresh-Token") String refreshToken
    ) {
        TokenResponse tokens = userService.refresh(refreshToken);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.TOKEN_REFRESHED, tokens));
    }

    @PatchMapping("/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (user == null) throw new UserException(UserErrorCode.UNAUTHORIZED_ACCESS);
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.PASSWORD_CHANGED));
    }

    @PostMapping("/email/verify")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail(@AuthenticationPrincipal User user) {
        if (user == null) throw new UserException(UserErrorCode.UNAUTHORIZED_ACCESS);
        emailVerificationService.sendVerificationEmail(user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.VERIFICATION_EMAIL_SENT));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.EMAIL_VERIFIED));
    }
}
