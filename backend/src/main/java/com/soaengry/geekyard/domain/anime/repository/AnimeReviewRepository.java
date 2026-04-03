package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AnimeReviewRepository extends JpaRepository<AnimeReview, Long> {

    @Query(value = "SELECT r FROM AnimeReview r JOIN FETCH r.anime LEFT JOIN FETCH r.user WHERE r.anime.id = :animeId AND r.content IS NOT NULL AND r.content <> '' ORDER BY r.createdAt DESC",
            countQuery = "SELECT COUNT(r) FROM AnimeReview r WHERE r.anime.id = :animeId AND r.content IS NOT NULL AND r.content <> ''")
    Page<AnimeReview> findByAnimeIdWithUser(@Param("animeId") Long animeId, Pageable pageable);

    Optional<AnimeReview> findByAnimeIdAndUser(Long animeId, User user);

    boolean existsByAnimeIdAndUser(Long animeId, User user);

    @Query("SELECT COALESCE(AVG(r.score), 0), COUNT(r) FROM AnimeReview r WHERE r.anime.id = :animeId")
    List<Object[]> findReviewStatsByAnimeId(@Param("animeId") Long animeId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE AnimeReview r SET r.likeCount = r.likeCount + 1 WHERE r.id = :reviewId")
    void incrementLikeCount(@Param("reviewId") Long reviewId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE AnimeReview r SET r.likeCount = r.likeCount - 1 WHERE r.id = :reviewId AND r.likeCount > 0")
    void decrementLikeCount(@Param("reviewId") Long reviewId);

    @Query("SELECT r FROM AnimeReview r WHERE r.user = :user AND r.anime.id IN :animeIds")
    List<AnimeReview> findByUserAndAnimeIdIn(@Param("user") User user, @Param("animeIds") List<Long> animeIds);
}
