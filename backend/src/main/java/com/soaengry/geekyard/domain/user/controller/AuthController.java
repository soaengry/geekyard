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
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/signup")
    @ApiSuccessCode(SuccessCode.SIGNUP)
    public TokenResponse signup(@Valid @RequestBody SignupRequest request) {
        return userService.signup(request);
    }

    @PostMapping("/login")
    @ApiSuccessCode(SuccessCode.LOGIN)
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/logout")
    @ApiSuccessCode(SuccessCode.LOGOUT)
    public Void logout(
            @AuthenticationPrincipal User user,
            @RequestHeader("X-Refresh-Token") String refreshToken
    ) {
        userService.logout(user, refreshToken);
        return null;
    }

    @PostMapping("/refresh")
    @ApiSuccessCode(SuccessCode.TOKEN_REFRESHED)
    public TokenResponse refresh(
            @RequestHeader("X-Refresh-Token") String refreshToken
    ) {
        return userService.refresh(refreshToken);
    }

    @PatchMapping("/password")
    @ApiSuccessCode(SuccessCode.PASSWORD_CHANGED)
    public Void changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (user == null) throw new UserException(UserErrorCode.UNAUTHORIZED_ACCESS);
        userService.changePassword(user, request);
        return null;
    }

    @PostMapping("/email/verify")
    @ApiSuccessCode(SuccessCode.VERIFICATION_EMAIL_SENT)
    public Void sendVerificationEmail(@AuthenticationPrincipal User user) {
        if (user == null) throw new UserException(UserErrorCode.UNAUTHORIZED_ACCESS);
        emailVerificationService.sendVerificationEmail(user);
        return null;
    }

    @GetMapping("/verify")
    @ApiSuccessCode(SuccessCode.EMAIL_VERIFIED)
    public Void verifyEmail(@RequestParam String token) {
        emailVerificationService.verifyEmail(token);
        return null;
    }
}
