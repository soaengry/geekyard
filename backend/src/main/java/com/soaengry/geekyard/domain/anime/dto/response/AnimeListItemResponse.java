package com.soaengry.geekyard.domain.anime.dto.response;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AnimeListItemResponse(
        String id,
        String name,
        String img,
        List<String> genres,
        Double avgRating,
        String medium,
        @JsonProperty("isAdult") Boolean isAdult,
        @JsonProperty("isEnding") Boolean isEnding
) {
    public static AnimeListItemResponse from(Anime anime) {
        return new AnimeListItemResponse(
                anime.getId(),
                anime.getName(),
                anime.getImg(),
                anime.getGenres(),
                anime.getAvgRating(),
                anime.getMedium(),
                anime.getIsAdult(),
                anime.getIsEnding()
        );
    }
}
