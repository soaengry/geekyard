package com.soaengry.geekyard.domain.anime.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.soaengry.geekyard.domain.anime.entity.Anime;

import java.util.List;

public record AnimeDetailResponse(
        String id,
        Integer laftelId,
        String name,
        String img,
        List<AnimeImageItem> images,
        HighlightVideoItem highlightVideo,
        List<String> genres,
        List<String> tags,
        String content,
        Double avgRating,
        List<CastItem> casts,
        List<DirectorItem> directors,
        List<ProductionCompanyItem> productionCompanies,
        String medium,
        @JsonProperty("isAdult") Boolean isAdult,
        @JsonProperty("isEnding") Boolean isEnding,
        String airYearQuarter,
        String contentRating,
        Integer seriesId
) {
    public record AnimeImageItem(String optionName, String imgUrl, String cropRatio) {
        public static AnimeImageItem from(Anime.AnimeImage image) {
            return new AnimeImageItem(image.getOptionName(), image.getImgUrl(), image.getCropRatio());
        }
    }

    public record HighlightVideoItem(String contentId, String dashUrl, String hlsUrl) {
        public static HighlightVideoItem from(Anime.HighlightVideo video) {
            if (video == null) return null;
            return new HighlightVideoItem(video.getContentId(), video.getDashUrl(), video.getHlsUrl());
        }
    }

    public record CastItem(String characterName, List<String> voiceActorNames) {
        public static CastItem from(Anime.Cast cast) {
            return new CastItem(cast.getCharacterName(), cast.getVoiceActorNames());
        }
    }

    public record DirectorItem(String name, String role) {
        public static DirectorItem from(Anime.Director director) {
            return new DirectorItem(director.getName(), director.getRole());
        }
    }

    public record ProductionCompanyItem(String name) {
        public static ProductionCompanyItem from(Anime.ProductionCompany company) {
            return new ProductionCompanyItem(company.getName());
        }
    }

    public static AnimeDetailResponse from(Anime anime) {
        List<AnimeImageItem> images = anime.getImages() == null ? List.of() :
                anime.getImages().stream().map(AnimeImageItem::from).toList();
        List<CastItem> casts = anime.getCasts() == null ? List.of() :
                anime.getCasts().stream().map(CastItem::from).toList();
        List<DirectorItem> directors = anime.getDirectors() == null ? List.of() :
                anime.getDirectors().stream().map(DirectorItem::from).toList();
        List<ProductionCompanyItem> companies = anime.getProductionCompanies() == null ? List.of() :
                anime.getProductionCompanies().stream().map(ProductionCompanyItem::from).toList();

        return new AnimeDetailResponse(
                anime.getId(),
                anime.getLaftelId(),
                anime.getName(),
                anime.getImg(),
                images,
                HighlightVideoItem.from(anime.getHighlightVideo()),
                anime.getGenres(),
                anime.getTags(),
                anime.getContent(),
                anime.getAvgRating(),
                casts,
                directors,
                companies,
                anime.getMedium(),
                anime.getIsAdult(),
                anime.getIsEnding(),
                anime.getAirYearQuarter(),
                anime.getContentRating(),
                anime.getSeriesId()
        );
    }
}
