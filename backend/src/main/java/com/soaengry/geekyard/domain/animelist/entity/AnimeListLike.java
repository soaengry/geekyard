package com.soaengry.geekyard.domain.animelist.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_list_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"anime_list_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeListLike extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_list_id", nullable = false)
    private AnimeList animeList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static AnimeListLike create(AnimeList animeList, User user) {
        AnimeListLike like = new AnimeListLike();
        like.animeList = animeList;
        like.user = user;
        return like;
    }
}
