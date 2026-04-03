package com.soaengry.geekyard.domain.anime.entity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

@Entity
@Table(name = "anime_metadata")
@Getter
@NoArgsConstructor
public class AnimeMetadata {

    @Id
    @Column(name = "anime_id")
    private Long animeId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "anime_id")
    private Anime anime;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "casts", columnDefinition = "jsonb")
    private List<CastData> casts;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags", columnDefinition = "jsonb")
    private List<String> tags;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "genres", columnDefinition = "jsonb")
    private List<String> genres;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "images", columnDefinition = "jsonb")
    private List<ImageData> images;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "directors", columnDefinition = "jsonb")
    private List<DirectorData> directors;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "production_companies", columnDefinition = "jsonb")
    private List<ProductionCompanyData> productionCompanies;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "awards", columnDefinition = "jsonb")
    private Object awards;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "highlight_video", columnDefinition = "jsonb")
    private HighlightVideoData highlightVideo;

    @Getter
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class CastData {
        private String characterName;
        private List<String> voiceActorNames;
    }

    @Getter
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ImageData {
        private String optionName;
        private String imgUrl;
        private String cropRatio;
    }

    @Getter
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class DirectorData {
        private String name;
        private String role;
    }

    @Getter
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class ProductionCompanyData {
        private String name;
    }

    @Getter
    @NoArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class HighlightVideoData {
        private String contentId;
        private String dashUrl;
        private String hlsUrl;
    }
}
