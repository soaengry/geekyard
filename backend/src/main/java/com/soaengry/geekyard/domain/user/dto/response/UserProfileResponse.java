package com.soaengry.geekyard.domain.user.dto.response;

import com.soaengry.geekyard.domain.user.entity.User;

public record UserProfileResponse(
        String username,
        String nickname,
        String bio,
        String profileImage
) {
    public static UserProfileResponse from(User user) {
        return new UserProfileResponse(
                user.getUsername(),
                user.getNickname(),
                user.getBio(),
                user.getProfileImage()
        );
    }
}
