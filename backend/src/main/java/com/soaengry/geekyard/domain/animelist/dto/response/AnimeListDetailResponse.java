package com.soaengry.geekyard.domain.animelist.dto.response;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import com.soaengry.geekyard.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public record AnimeListDetailResponse(
        Long id,
        String title,
        String description,
        List<String> coverImages,
        String authorNickname,
        String authorProfileImage,
        Integer likeCount,
        Integer itemCount,
        boolean liked,
        boolean isOwner,
        boolean isPublic,
        List<AnimeListItemResponse> items,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AnimeListDetailResponse from(AnimeList animeList, List<AnimeListItemResponse> items,
                                                List<String> coverImages, boolean liked, boolean isOwner) {
        User user = animeList.getUser();
        return new AnimeListDetailResponse(
                animeList.getId(),
                animeList.getTitle(),
                animeList.getDescription(),
                coverImages,
                user.getNickname(),
                user.getProfileImage(),
                animeList.getLikeCount(),
                items.size(),
                liked,
                isOwner,
                animeList.getIsPublic(),
                items,
                animeList.getCreatedAt(),
                animeList.getUpdatedAt()
        );
    }
}
