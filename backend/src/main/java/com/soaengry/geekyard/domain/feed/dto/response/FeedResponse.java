package com.soaengry.geekyard.domain.feed.dto.response;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public record FeedResponse(
        Long id,
        Long userId,
        String nickname,
        String profileImage,
        Long animeId,
        String animeName,
        String animeImg,
        String content,
        List<String> imageUrls,
        Integer likeCount,
        Integer commentCount,
        boolean liked,
        boolean bookmarked,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static FeedResponse from(Feed feed, boolean liked, boolean bookmarked) {
        User user = feed.getUser();
        Anime anime = feed.getAnime();
        Long animeId = null;
        String animeName = null;
        String animeImg = null;
        if (anime != null) {
            animeId = anime.getId();
            animeName = anime.getName();
            if (anime.getMetadata() != null && anime.getMetadata().getImages() != null) {
                animeImg = anime.getMetadata().getImages().stream()
                        .filter(img -> "home_default".equals(img.getOptionName()))
                        .findFirst()
                        .map(img -> img.getImgUrl())
                        .orElse(null);
            }
        }
        return new FeedResponse(
                feed.getId(),
                user.getId(),
                user.getNickname(),
                user.getProfileImage(),
                animeId,
                animeName,
                animeImg,
                feed.getContent(),
                feed.getImageUrls(),
                feed.getLikeCount(),
                feed.getCommentCount(),
                liked,
                bookmarked,
                feed.getCreatedAt(),
                feed.getUpdatedAt()
        );
    }
}
