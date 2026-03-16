package com.soaengry.geekyard.domain.chat.dto.response;

import com.soaengry.geekyard.domain.chat.entity.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long animeId,
        Long userId,
        String nickname,
        String profileImage,
        String message,
        LocalDateTime createdAt
) {
    public static ChatMessageResponse from(ChatMessage chatMessage) {
        return new ChatMessageResponse(
                chatMessage.getId(),
                chatMessage.getAnime().getId(),
                chatMessage.getUser().getId(),
                chatMessage.getUser().getNickname(),
                chatMessage.getUser().getProfileImage(),
                chatMessage.getMessage(),
                chatMessage.getCreatedAt()
        );
    }
}
