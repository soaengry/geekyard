package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedRepository extends JpaRepository<Feed, Long> {

    @Query(value = "SELECT f FROM Feed f JOIN FETCH f.user LEFT JOIN FETCH f.anime WHERE f.anime.id = :animeId ORDER BY f.createdAt DESC",
            countQuery = "SELECT COUNT(f) FROM Feed f WHERE f.anime.id = :animeId")
    Page<Feed> findByAnimeIdWithDetails(@Param("animeId") Long animeId, Pageable pageable);

    @Query(value = "SELECT f FROM Feed f JOIN FETCH f.user LEFT JOIN FETCH f.anime ORDER BY f.createdAt DESC",
            countQuery = "SELECT COUNT(f) FROM Feed f")
    Page<Feed> findAllWithDetails(Pageable pageable);

    Page<Feed> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    @Modifying
    @Query("UPDATE Feed f SET f.likeCount = f.likeCount + 1 WHERE f.id = :feedId")
    void incrementLikeCount(@Param("feedId") Long feedId);

    @Modifying
    @Query("UPDATE Feed f SET f.likeCount = f.likeCount - 1 WHERE f.id = :feedId AND f.likeCount > 0")
    void decrementLikeCount(@Param("feedId") Long feedId);

    @Modifying
    @Query("UPDATE Feed f SET f.commentCount = f.commentCount + 1 WHERE f.id = :feedId")
    void incrementCommentCount(@Param("feedId") Long feedId);

    @Modifying
    @Query("UPDATE Feed f SET f.commentCount = f.commentCount - 1 WHERE f.id = :feedId AND f.commentCount > 0")
    void decrementCommentCount(@Param("feedId") Long feedId);
}
