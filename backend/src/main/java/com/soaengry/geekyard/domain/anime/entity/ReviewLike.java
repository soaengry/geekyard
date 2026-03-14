package com.soaengry.geekyard.domain.anime.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "review_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"review_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class ReviewLike extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private AnimeReview review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static ReviewLike create(AnimeReview review, User user) {
        ReviewLike like = new ReviewLike();
        like.review = review;
        like.user = user;
        return like;
    }
}
