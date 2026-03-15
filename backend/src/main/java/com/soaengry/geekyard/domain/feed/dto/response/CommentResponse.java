package com.soaengry.geekyard.domain.feed.dto.response;

import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.user.entity.User;

import java.time.LocalDateTime;

public record CommentResponse(
        Long id,
        Long feedId,
        Long userId,
        String nickname,
        String profileImage,
        String content,
        Integer likeCount,
        boolean liked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CommentResponse from(FeedComment comment, boolean liked) {
        User user = comment.getUser();
        return new CommentResponse(
                comment.getId(),
                comment.getFeed().getId(),
                user.getId(),
                user.getNickname(),
                user.getProfileImage(),
                comment.getContent(),
                comment.getLikeCount(),
                liked,
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }
}
