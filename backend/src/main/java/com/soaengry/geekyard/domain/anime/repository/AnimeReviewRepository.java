package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeReviewRepository extends JpaRepository<AnimeReview, Long> {

    @Query("SELECT r FROM AnimeReview r LEFT JOIN FETCH r.user WHERE r.anime.id = :animeId ORDER BY r.createdAt DESC")
    Page<AnimeReview> findByAnimeIdWithUser(@Param("animeId") Long animeId, Pageable pageable);

    Optional<AnimeReview> findByAnimeIdAndUser(Long animeId, User user);

    boolean existsByAnimeIdAndUser(Long animeId, User user);

    @Query("SELECT COALESCE(AVG(r.score), 0), COUNT(r) FROM AnimeReview r WHERE r.anime.id = :animeId")
    List<Object[]> findReviewStatsByAnimeId(@Param("animeId") Long animeId);
}
