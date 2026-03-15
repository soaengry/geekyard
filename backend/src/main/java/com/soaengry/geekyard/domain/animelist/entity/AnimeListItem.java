package com.soaengry.geekyard.domain.animelist.entity;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_list_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"anime_list_id", "anime_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeListItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_list_id", nullable = false)
    private AnimeList animeList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @Column(nullable = false)
    private Integer orderIndex;

    public static AnimeListItem create(AnimeList animeList, Anime anime, Integer orderIndex) {
        AnimeListItem item = new AnimeListItem();
        item.animeList = animeList;
        item.anime = anime;
        item.orderIndex = orderIndex;
        return item;
    }
}
