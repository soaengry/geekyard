package com.soaengry.geekyard.domain.animelist.dto.response;

import com.soaengry.geekyard.domain.animelist.entity.AnimeList;

import java.time.LocalDateTime;

public record MyAnimeListResponse(
        Long id,
        String title,
        Integer itemCount,
        LocalDateTime createdAt
) {
    public static MyAnimeListResponse from(AnimeList animeList, int itemCount) {
        return new MyAnimeListResponse(
                animeList.getId(),
                animeList.getTitle(),
                itemCount,
                animeList.getCreatedAt()
        );
    }
}
