package com.soaengry.geekyard.domain.anime.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_similar", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"anime_id", "similar_anime_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeSimilar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "similar_anime_id", nullable = false)
    private Anime similarAnime;

    @Column(name = "similarity", nullable = false, precision = 5, scale = 4)
    private BigDecimal similarity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
