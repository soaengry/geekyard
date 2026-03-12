package com.soaengry.geekyard.domain.user.controller;

import com.soaengry.geekyard.domain.user.dto.request.RecoverAccountRequest;
import com.soaengry.geekyard.domain.user.dto.request.UpdateProfileRequest;
import com.soaengry.geekyard.domain.user.dto.response.MyProfileResponse;
import com.soaengry.geekyard.domain.user.dto.response.UserProfileResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.service.UserService;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MyProfileResponse>> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.OK, userService.getMyProfile(user)));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<MyProfileResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.PROFILE_UPDATED, userService.updateProfile(user, request)));
    }

    @PatchMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<MyProfileResponse>> updateProfileImage(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.PROFILE_UPDATED, userService.updateProfileImage(user, file)));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal User user) {
        userService.deleteAccount(user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.ACCOUNT_DELETED));
    }

    @PostMapping("/recover")
    public ResponseEntity<ApiResponse<Void>> recoverAccount(@Valid @RequestBody RecoverAccountRequest request) {
        userService.recoverAccount(request);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.ACCOUNT_RECOVERED));
    }

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(@PathVariable String username) {
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.OK, userService.getUserProfile(username)));
    }
}
