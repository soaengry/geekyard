package com.soaengry.geekyard.domain.animelist.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "anime_lists")
@Getter
@NoArgsConstructor(access = PROTECTED)
public class AnimeList extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Boolean isPublic = true;

    @Column(nullable = false)
    private Integer likeCount = 0;

    public static AnimeList create(User user, String title, String description, Boolean isPublic) {
        AnimeList animeList = new AnimeList();
        animeList.user = user;
        animeList.title = title;
        animeList.description = description;
        animeList.isPublic = isPublic != null ? isPublic : true;
        animeList.likeCount = 0;
        return animeList;
    }

    public void update(String title, String description, Boolean isPublic) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (isPublic != null) this.isPublic = isPublic;
    }
}
