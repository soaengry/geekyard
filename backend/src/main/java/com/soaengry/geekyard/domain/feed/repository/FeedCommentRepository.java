package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedCommentRepository extends JpaRepository<FeedComment, Long> {

    @Query("SELECT c FROM FeedComment c JOIN FETCH c.user WHERE c.feed.id = :feedId ORDER BY c.createdAt DESC")
    Page<FeedComment> findByFeedIdWithUser(@Param("feedId") Long feedId, Pageable pageable);

    @Query("SELECT c FROM FeedComment c JOIN FETCH c.user JOIN FETCH c.feed WHERE c.user = :user ORDER BY c.createdAt DESC")
    Page<FeedComment> findByUserWithFeed(@Param("user") User user, Pageable pageable);
}
