package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.entity.ReviewBookmark;
import com.soaengry.geekyard.domain.anime.entity.ReviewLike;
import com.soaengry.geekyard.domain.anime.repository.AnimeReviewRepository;
import com.soaengry.geekyard.domain.anime.repository.ReviewBookmarkRepository;
import com.soaengry.geekyard.domain.anime.repository.ReviewLikeRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.dto.BookmarkResponse;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewInteractionService {

    private final AnimeReviewRepository animeReviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final ReviewBookmarkRepository reviewBookmarkRepository;
    private final ReviewFinder reviewFinder;

    @Transactional
    public LikeResponse toggleLike(Long animeId, Long reviewId, User user) {
        AnimeReview review = reviewFinder.findOrThrow(reviewId, animeId);
        return reviewLikeRepository.findByReviewAndUser(review, user)
                .map(like -> {
                    reviewLikeRepository.delete(like);
                    animeReviewRepository.decrementLikeCount(review.getId());
                    return new LikeResponse(false, review.getLikeCount() - 1);
                })
                .orElseGet(() -> {
                    try {
                        reviewLikeRepository.save(ReviewLike.create(review, user));
                    } catch (DataIntegrityViolationException e) {
                        return new LikeResponse(true, review.getLikeCount());
                    }
                    animeReviewRepository.incrementLikeCount(review.getId());
                    return new LikeResponse(true, review.getLikeCount() + 1);
                });
    }

    @Transactional
    public BookmarkResponse toggleBookmark(Long animeId, Long reviewId, User user) {
        AnimeReview review = reviewFinder.findOrThrow(reviewId, animeId);
        return reviewBookmarkRepository.findByReviewAndUser(review, user)
                .map(bookmark -> {
                    reviewBookmarkRepository.delete(bookmark);
                    return new BookmarkResponse(false);
                })
                .orElseGet(() -> {
                    try {
                        reviewBookmarkRepository.save(ReviewBookmark.create(review, user));
                    } catch (DataIntegrityViolationException e) {
                        return new BookmarkResponse(true);
                    }
                    return new BookmarkResponse(true);
                });
    }
}
