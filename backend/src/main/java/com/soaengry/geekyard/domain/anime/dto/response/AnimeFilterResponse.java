package com.soaengry.geekyard.domain.anime.dto.response;

import com.soaengry.geekyard.domain.anime.entity.AnimeFilter;

import java.util.List;

public record AnimeFilterResponse(
        List<String> genres,
        List<String> tags,
        List<String> years
) {
    public static AnimeFilterResponse from(AnimeFilter filter) {
        return new AnimeFilterResponse(
                filter.getGenres(),
                filter.getTags(),
                filter.getYears()
        );
    }
}
