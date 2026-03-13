package com.soaengry.geekyard.domain.anime.dto.response;

import java.util.List;

public record AnimeFilterResponse(
        List<String> genres,
        List<String> tags,
        List<String> years
) {
    public static AnimeFilterResponse from(List<String> genres, List<String> tags, List<String> years) {
        return new AnimeFilterResponse(genres, tags, years);
    }
}
