package com.soaengry.geekyard.domain.anime.dto.response;

import com.soaengry.geekyard.domain.anime.entity.AnimeGenre;
import com.soaengry.geekyard.domain.anime.entity.AnimeTag;
import com.soaengry.geekyard.domain.anime.entity.AnimeYear;

import java.util.List;

public record AnimeFilterResponse(
        List<String> genres,
        List<String> tags,
        List<String> years
) {
    public static AnimeFilterResponse from(
            List<AnimeGenre> genres,
            List<AnimeTag> tags,
            List<AnimeYear> years
    ) {
        return new AnimeFilterResponse(
                genres.stream().map(AnimeGenre::getName).toList(),
                tags.stream().map(AnimeTag::getName).toList(),
                years.stream().map(AnimeYear::getName).toList()
        );
    }
}
