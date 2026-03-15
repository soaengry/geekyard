package com.soaengry.geekyard.domain.animelist.dto.response;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;
import com.soaengry.geekyard.domain.user.entity.User;

import java.time.LocalDateTime;
import java.util.List;

public record AnimeListSummaryResponse(
        Long id,
        String title,
        String description,
        List<String> coverImages,
        String authorNickname,
        String authorProfileImage,
        Integer likeCount,
        Integer itemCount,
        boolean liked,
        LocalDateTime createdAt
) {
    public static AnimeListSummaryResponse from(AnimeList animeList, List<String> coverImages,
                                                 int itemCount, boolean liked) {
        User user = animeList.getUser();
        return new AnimeListSummaryResponse(
                animeList.getId(),
                animeList.getTitle(),
                animeList.getDescription(),
                coverImages,
                user.getNickname(),
                user.getProfileImage(),
                animeList.getLikeCount(),
                itemCount,
                liked,
                animeList.getCreatedAt()
        );
    }
}
