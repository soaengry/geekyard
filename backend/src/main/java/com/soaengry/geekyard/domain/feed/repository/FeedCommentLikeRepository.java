package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.FeedComment;
import com.soaengry.geekyard.domain.feed.entity.FeedCommentLike;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedCommentLikeRepository extends JpaRepository<FeedCommentLike, Long> {

    Optional<FeedCommentLike> findByCommentAndUser(FeedComment comment, User user);

    @Query("SELECT cl.comment.id FROM FeedCommentLike cl WHERE cl.user = :user AND cl.comment.id IN :commentIds")
    List<Long> findLikedCommentIdsByUserAndCommentIds(@Param("user") User user, @Param("commentIds") List<Long> commentIds);

    void deleteByComment(FeedComment comment);
}
