package com.soaengry.geekyard.domain.anime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeMetadata;
import com.soaengry.geekyard.domain.anime.entity.AnimeSimilar;

import java.math.BigDecimal;
import java.util.List;

public record SimilarAnimeResponse(
        Long id,
        String name,
        String img,
        List<String> genres,
        BigDecimal avgRating,
        String medium,
        @JsonProperty("isAdult") Boolean isAdult,
        BigDecimal similarity
) {
    public static SimilarAnimeResponse from(AnimeSimilar animeSimilar) {
        Anime anime = animeSimilar.getSimilarAnime();
        AnimeMetadata metadata = anime.getMetadata();
        List<String> genres = (metadata != null && metadata.getGenres() != null) ? metadata.getGenres() : List.of();
        String img = deriveImg(metadata);

        return new SimilarAnimeResponse(
                anime.getId(),
                anime.getName(),
                img,
                genres,
                anime.getAvgRating(),
                anime.getMedium(),
                anime.getIsAdult(),
                animeSimilar.getSimilarity()
        );
    }

    private static String deriveImg(AnimeMetadata metadata) {
        if (metadata == null || metadata.getImages() == null || metadata.getImages().isEmpty()) return null;
        return metadata.getImages().stream()
                .filter(img -> "home_default".equals(img.getOptionName()))
                .findFirst()
                .map(AnimeMetadata.ImageData::getImgUrl)
                .orElse(metadata.getImages().get(0).getImgUrl());
    }
}
