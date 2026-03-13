package com.soaengry.geekyard.domain.anime.entity;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Getter
@NoArgsConstructor
@Document(collection = "animation")
public class Anime {

    @Id
    private String id;

    @Field("id")
    private Integer laftelId;

    private String name;

    private String img;

    private List<AnimeImage> images;

    @Field("highlight_video")
    private HighlightVideo highlightVideo;

    private List<String> genres;

    private List<String> tags;

    private String content;

    @Field("avg_rating")
    private Double avgRating;

    private List<Cast> casts;

    private List<Director> directors;

    @Field("production_companies")
    private List<ProductionCompany> productionCompanies;

    private String medium;

    @Field("is_adult")
    private Boolean isAdult;

    @Field("is_ending")
    private Boolean isEnding;

    @Field("air_year_quarter")
    private String airYearQuarter;

    @Field("content_rating")
    private String contentRating;

    @Field("series_id")
    private Integer seriesId;

    private Integer rating;

    @Getter
    @NoArgsConstructor
    public static class AnimeImage {
        @Field("option_name")
        private String optionName;
        @Field("img_url")
        private String imgUrl;
        @Field("crop_ratio")
        private String cropRatio;
    }

    @Getter
    @NoArgsConstructor
    public static class Cast {
        @Field("character_name")
        private String characterName;
        @Field("voice_actor_names")
        private List<String> voiceActorNames;
    }

    @Getter
    @NoArgsConstructor
    public static class Director {
        private String name;
        private String role;
    }

    @Getter
    @NoArgsConstructor
    public static class HighlightVideo {
        @Field("content_id")
        private String contentId;
        @Field("dash_url")
        private String dashUrl;
        @Field("hls_url")
        private String hlsUrl;
    }

    @Getter
    @NoArgsConstructor
    public static class ProductionCompany {
        private String name;
    }
}
