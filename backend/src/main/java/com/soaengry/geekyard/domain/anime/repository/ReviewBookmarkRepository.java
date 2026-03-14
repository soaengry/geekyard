package com.soaengry.geekyard.domain.anime.repository;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.entity.ReviewBookmark;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewBookmarkRepository extends JpaRepository<ReviewBookmark, Long> {

    boolean existsByReviewAndUser(AnimeReview review, User user);

    Optional<ReviewBookmark> findByReviewAndUser(AnimeReview review, User user);

    @Query("SELECT rb.review.id FROM ReviewBookmark rb WHERE rb.user = :user AND rb.review.id IN :reviewIds")
    List<Long> findBookmarkedReviewIdsByUserAndReviewIds(@Param("user") User user, @Param("reviewIds") List<Long> reviewIds);

    @Query("SELECT rb.review FROM ReviewBookmark rb JOIN FETCH rb.review.anime LEFT JOIN FETCH rb.review.user WHERE rb.user = :user ORDER BY rb.createdAt DESC")
    Page<AnimeReview> findBookmarkedReviewsByUser(@Param("user") User user, Pageable pageable);
}
