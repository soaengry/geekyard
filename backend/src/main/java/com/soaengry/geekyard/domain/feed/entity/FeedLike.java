package com.soaengry.geekyard.domain.feed.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "feed_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"feed_id", "user_id"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class FeedLike extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_id", nullable = false)
    private Feed feed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public static FeedLike create(Feed feed, User user) {
        FeedLike feedLike = new FeedLike();
        feedLike.feed = feed;
        feedLike.user = user;
        return feedLike;
    }
}
