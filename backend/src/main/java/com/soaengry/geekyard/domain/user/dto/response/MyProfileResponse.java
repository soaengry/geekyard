package com.soaengry.geekyard.domain.user.dto.response;

import com.soaengry.geekyard.domain.user.entity.AuthProvider;
import com.soaengry.geekyard.domain.user.entity.User;

import java.time.LocalDateTime;

public record MyProfileResponse(
        Long id,
        String email,
        String username,
        String nickname,
        String bio,
        String profileImage,
        AuthProvider authProvider,
        boolean emailVerified,
        LocalDateTime createdAt
) {
    public static MyProfileResponse from(User user) {
        return new MyProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getNickname(),
                user.getBio(),
                user.getProfileImage(),
                user.getAuthProvider(),
                user.isEmailVerified(),
                user.getCreatedAt()
        );
    }
}
