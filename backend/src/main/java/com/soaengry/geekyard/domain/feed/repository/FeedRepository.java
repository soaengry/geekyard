package com.soaengry.geekyard.domain.feed.repository;

import com.soaengry.geekyard.domain.feed.entity.Feed;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedRepository extends JpaRepository<Feed, Long> {

    @Query("SELECT f FROM Feed f JOIN FETCH f.user JOIN FETCH f.anime WHERE f.anime.id = :animeId ORDER BY f.createdAt DESC")
    Page<Feed> findByAnimeIdWithDetails(@Param("animeId") Long animeId, Pageable pageable);

    @Query("SELECT f FROM Feed f JOIN FETCH f.user JOIN FETCH f.anime ORDER BY f.createdAt DESC")
    Page<Feed> findAllWithDetails(Pageable pageable);

    Page<Feed> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
