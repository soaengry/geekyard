package com.soaengry.geekyard.domain.anime.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "review_bookmarks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"review_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class ReviewBookmark extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private AnimeReview review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static ReviewBookmark create(AnimeReview review, User user) {
        ReviewBookmark bookmark = new ReviewBookmark();
        bookmark.review = review;
        bookmark.user = user;
        return bookmark;
    }
}
