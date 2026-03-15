package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedCommentRepository extends JpaRepository<FeedComment, Long> {

    @Query(value = "SELECT c FROM FeedComment c JOIN FETCH c.user WHERE c.feed.id = :feedId ORDER BY c.createdAt DESC",
            countQuery = "SELECT COUNT(c) FROM FeedComment c WHERE c.feed.id = :feedId")
    Page<FeedComment> findByFeedIdWithUser(@Param("feedId") Long feedId, Pageable pageable);

    @Query(value = "SELECT c FROM FeedComment c JOIN FETCH c.user WHERE c.feed.id = :feedId ORDER BY c.likeCount DESC, c.createdAt DESC",
            countQuery = "SELECT COUNT(c) FROM FeedComment c WHERE c.feed.id = :feedId")
    Page<FeedComment> findByFeedIdWithUserByPopular(@Param("feedId") Long feedId, Pageable pageable);

    @Query(value = "SELECT c FROM FeedComment c JOIN FETCH c.user JOIN FETCH c.feed WHERE c.user = :user ORDER BY c.createdAt DESC",
            countQuery = "SELECT COUNT(c) FROM FeedComment c WHERE c.user = :user")
    Page<FeedComment> findByUserWithFeed(@Param("user") User user, Pageable pageable);

    @Modifying
    @Query("UPDATE FeedComment c SET c.likeCount = c.likeCount + 1 WHERE c.id = :commentId")
    void incrementLikeCount(@Param("commentId") Long commentId);

    @Modifying
    @Query("UPDATE FeedComment c SET c.likeCount = c.likeCount - 1 WHERE c.id = :commentId AND c.likeCount > 0")
    void decrementLikeCount(@Param("commentId") Long commentId);

    void deleteByFeed(Feed feed);
}
