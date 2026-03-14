package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.feed.entity.FeedBookmark;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeedBookmarkRepository extends JpaRepository<FeedBookmark, Long> {

    boolean existsByFeedAndUser(Feed feed, User user);

    Optional<FeedBookmark> findByFeedAndUser(Feed feed, User user);

    @Query("SELECT fb.feed.id FROM FeedBookmark fb WHERE fb.user = :user AND fb.feed.id IN :feedIds")
    List<Long> findBookmarkedFeedIdsByUserAndFeedIds(@Param("user") User user, @Param("feedIds") List<Long> feedIds);

    @Query("SELECT fb.feed FROM FeedBookmark fb JOIN FETCH fb.feed.user JOIN FETCH fb.feed.anime WHERE fb.user = :user ORDER BY fb.createdAt DESC")
    Page<Feed> findBookmarkedFeedsByUser(@Param("user") User user, Pageable pageable);
}
