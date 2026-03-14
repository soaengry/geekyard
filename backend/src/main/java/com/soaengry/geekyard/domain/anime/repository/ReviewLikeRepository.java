package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.entity.ReviewLike;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {

    boolean existsByReviewAndUser(AnimeReview review, User user);

    Optional<ReviewLike> findByReviewAndUser(AnimeReview review, User user);

    @Query("SELECT rl.review.id FROM ReviewLike rl WHERE rl.user = :user AND rl.review.id IN :reviewIds")
    List<Long> findLikedReviewIdsByUserAndReviewIds(@Param("user") User user, @Param("reviewIds") List<Long> reviewIds);

    @Query("SELECT rl.review FROM ReviewLike rl JOIN FETCH rl.review.anime LEFT JOIN FETCH rl.review.user WHERE rl.user = :user ORDER BY rl.createdAt DESC")
    Page<AnimeReview> findLikedReviewsByUser(@Param("user") User user, Pageable pageable);
}
