package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedLike;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedLikeRepository extends JpaRepository<FeedLike, Long> {

    boolean existsByFeedAndUser(Feed feed, User user);

    Optional<FeedLike> findByFeedAndUser(Feed feed, User user);

    @Query("SELECT fl.feed.id FROM FeedLike fl WHERE fl.user = :user AND fl.feed.id IN :feedIds")
    List<Long> findLikedFeedIdsByUserAndFeedIds(@Param("user") User user, @Param("feedIds") List<Long> feedIds);

    @Query("SELECT fl.feed FROM FeedLike fl JOIN FETCH fl.feed.user JOIN FETCH fl.feed.anime WHERE fl.user = :user ORDER BY fl.createdAt DESC")
    Page<Feed> findLikedFeedsByUser(@Param("user") User user, Pageable pageable);
}
