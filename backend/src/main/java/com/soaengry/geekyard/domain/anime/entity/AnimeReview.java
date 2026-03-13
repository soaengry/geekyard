package com.soaengry.geekyard.domain.anime.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_reviews")
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeReview extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "external_user_id")
    private Long externalUserId;

    @Column(name = "external_username")
    private String externalUsername;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Integer likeCount = 0;

    @Builder
    private AnimeReview(Anime anime, User user, Long externalUserId, String externalUsername,
                        BigDecimal score, String content) {
        this.anime = anime;
        this.user = user;
        this.externalUserId = externalUserId;
        this.externalUsername = externalUsername;
        this.score = score;
        this.content = content;
        this.likeCount = 0;
    }

    public static AnimeReview create(Anime anime, User user, BigDecimal score, String content) {
        return AnimeReview.builder()
                .anime(anime)
                .user(user)
                .score(score)
                .content(content)
                .build();
    }

    public boolean isSiteUser() {
        return user != null;
    }

    public void update(BigDecimal score, String content) {
        if (score != null) this.score = score;
        if (content != null) this.content = content;
    }
}
