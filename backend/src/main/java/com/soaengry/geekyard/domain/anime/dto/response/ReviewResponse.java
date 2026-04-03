package com.soaengry.geekyard.domain.anime.dto.response;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Long userId,
        String nickname,
        String profileImage,
        Long animeId,
        String animeName,
        BigDecimal score,
        String content,
        Integer likeCount,
        boolean liked,
        boolean isSiteUser,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static ReviewResponse from(AnimeReview review, String nickname, String profileImage) {
        return from(review, nickname, profileImage, false);
    }

    public static ReviewResponse from(AnimeReview review, String nickname, String profileImage,
                                       boolean liked) {
        boolean siteUser = review.isSiteUser();
        Long userId = siteUser ? review.getUser().getId() : review.getExternalUserId();
        return new ReviewResponse(
                review.getId(),
                userId,
                nickname,
                profileImage,
                review.getAnime().getId(),
                review.getAnime().getName(),
                review.getScore(),
                review.getContent(),
                review.getLikeCount(),
                liked,
                siteUser,
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }
}
