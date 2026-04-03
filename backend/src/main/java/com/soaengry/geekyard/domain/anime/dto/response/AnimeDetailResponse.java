package com.soaengry.geekyard.domain.anime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeMetadata;

import java.math.BigDecimal;
import java.util.List;

public record AnimeDetailResponse(
        Long id,
        String name,
        String img,
        List<AnimeImageItem> images,
        HighlightVideoItem highlightVideo,
        List<String> genres,
        List<String> tags,
        String content,
        BigDecimal avgRating,
        List<CastItem> casts,
        List<DirectorItem> directors,
        List<ProductionCompanyItem> productionCompanies,
        String medium,
        @JsonProperty("isAdult") Boolean isAdult,
        String airYearQuarter,
        Long seriesId,
        Boolean watched
) {
    public record AnimeImageItem(String optionName, String imgUrl, String cropRatio) {
        public static AnimeImageItem from(AnimeMetadata.ImageData image) {
            return new AnimeImageItem(image.getOptionName(), image.getImgUrl(), image.getCropRatio());
        }
    }

    public record HighlightVideoItem(String contentId, String dashUrl, String hlsUrl) {
        public static HighlightVideoItem from(AnimeMetadata.HighlightVideoData video) {
            if (video == null) return null;
            return new HighlightVideoItem(video.getContentId(), video.getDashUrl(), video.getHlsUrl());
        }
    }

    public record CastItem(String characterName, List<String> voiceActorNames) {
        public static CastItem from(AnimeMetadata.CastData cast) {
            return new CastItem(cast.getCharacterName(), cast.getVoiceActorNames());
        }
    }

    public record DirectorItem(String name, String role) {
        public static DirectorItem from(AnimeMetadata.DirectorData director) {
            return new DirectorItem(director.getName(), director.getRole());
        }
    }

    public record ProductionCompanyItem(String name) {
        public static ProductionCompanyItem from(AnimeMetadata.ProductionCompanyData company) {
            return new ProductionCompanyItem(company.getName());
        }
    }

    public static AnimeDetailResponse from(Anime anime, Boolean watched) {
        AnimeMetadata metadata = anime.getMetadata();

        List<AnimeImageItem> images = (metadata == null || metadata.getImages() == null) ? List.of() :
                metadata.getImages().stream().map(AnimeImageItem::from).toList();
        List<CastItem> casts = (metadata == null || metadata.getCasts() == null) ? List.of() :
                metadata.getCasts().stream().map(CastItem::from).toList();
        List<DirectorItem> directors = (metadata == null || metadata.getDirectors() == null) ? List.of() :
                metadata.getDirectors().stream().map(DirectorItem::from).toList();
        List<ProductionCompanyItem> companies = (metadata == null || metadata.getProductionCompanies() == null) ? List.of() :
                metadata.getProductionCompanies().stream().map(ProductionCompanyItem::from).toList();
        List<String> genres = (metadata == null || metadata.getGenres() == null) ? List.of() : metadata.getGenres();
        List<String> tags = (metadata == null || metadata.getTags() == null) ? List.of() : metadata.getTags();

        String img = deriveImg(images);

        return new AnimeDetailResponse(
                anime.getId(),
                anime.getName(),
                img,
                images,
                metadata == null ? null : HighlightVideoItem.from(metadata.getHighlightVideo()),
                genres,
                tags,
                anime.getSynopsis(),
                anime.getAvgRating(),
                casts,
                directors,
                companies,
                anime.getMedium(),
                anime.getIsAdult(),
                anime.getAirYearQuarter(),
                anime.getSeriesId(),
                watched
        );
    }

    private static String deriveImg(List<AnimeImageItem> images) {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(img -> "home_default".equals(img.optionName()))
                .findFirst()
                .map(AnimeImageItem::imgUrl)
                .orElse(images.get(0).imgUrl());
    }
}
