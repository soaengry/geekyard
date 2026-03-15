package com.soaengry.geekyard.domain.anime.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_watches", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"anime_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeWatch extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static AnimeWatch create(Anime anime, User user) {
        AnimeWatch watch = new AnimeWatch();
        watch.anime = anime;
        watch.user = user;
        return watch;
    }
}
