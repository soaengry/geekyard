package com.soaengry.geekyard.domain.anime.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "anime")
@Getter
@NoArgsConstructor
public class Anime {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "series_id")
    private Long seriesId;

    @Column(name = "air_year_quarter")
    private String airYearQuarter;

    @Column(name = "medium")
    private String medium;

    @Column(name = "synopsis", columnDefinition = "TEXT")
    private String synopsis;

    @Column(name = "production")
    private String production;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    private BigDecimal avgRating;

    @Column(name = "is_adult")
    private Boolean isAdult;

    @Column(name = "is_dubbed")
    private Boolean isDubbed;

    @Column(name = "is_uncensored")
    private Boolean isUncensored;

    @Column(name = "latest_episode_release_datetime")
    private LocalDateTime latestEpisodeReleaseDatetime;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @Column(name = "feed_count", nullable = false, columnDefinition = "integer default 0")
    private Integer feedCount = 0;

    @OneToOne(mappedBy = "anime", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private AnimeMetadata metadata;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
