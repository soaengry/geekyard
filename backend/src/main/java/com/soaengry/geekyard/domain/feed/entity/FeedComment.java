package com.soaengry.geekyard.domain.feed.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "feed_comments")
@Getter
@NoArgsConstructor(access = PROTECTED)
public class FeedComment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feed_id", nullable = false)
    private Feed feed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private Integer likeCount = 0;

    @Builder
    private FeedComment(Feed feed, User user, String content) {
        this.feed = feed;
        this.user = user;
        this.content = content;
        this.likeCount = 0;
    }

    public static FeedComment create(Feed feed, User user, String content) {
        return FeedComment.builder()
                .feed(feed)
                .user(user)
                .content(content)
                .build();
    }

    public void update(String content) {
        if (content != null) this.content = content;
    }
}
