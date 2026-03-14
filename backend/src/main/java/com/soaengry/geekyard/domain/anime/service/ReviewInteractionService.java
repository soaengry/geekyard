package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.entity.ReviewBookmark;
import com.soaengry.geekyard.domain.anime.entity.ReviewLike;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeReviewRepository;
import com.soaengry.geekyard.domain.anime.repository.ReviewBookmarkRepository;
import com.soaengry.geekyard.domain.anime.repository.ReviewLikeRepository;
import com.soaengry.geekyard.domain.feed.dto.response.BookmarkResponse;
import com.soaengry.geekyard.domain.feed.dto.response.LikeResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewInteractionService {

    private final AnimeReviewRepository animeReviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final ReviewBookmarkRepository reviewBookmarkRepository;

    @Transactional
    public LikeResponse toggleLike(Long animeId, Long reviewId, User user) {
        AnimeReview review = findReviewOrThrow(reviewId, animeId);
        return reviewLikeRepository.findByReviewAndUser(review, user)
                .map(like -> {
                    reviewLikeRepository.delete(like);
                    review.decrementLikeCount();
                    return new LikeResponse(false, review.getLikeCount());
                })
                .orElseGet(() -> {
                    reviewLikeRepository.save(ReviewLike.create(review, user));
                    review.incrementLikeCount();
                    return new LikeResponse(true, review.getLikeCount());
                });
    }

    @Transactional
    public BookmarkResponse toggleBookmark(Long animeId, Long reviewId, User user) {
        AnimeReview review = findReviewOrThrow(reviewId, animeId);
        return reviewBookmarkRepository.findByReviewAndUser(review, user)
                .map(bookmark -> {
                    reviewBookmarkRepository.delete(bookmark);
                    return new BookmarkResponse(false);
                })
                .orElseGet(() -> {
                    reviewBookmarkRepository.save(ReviewBookmark.create(review, user));
                    return new BookmarkResponse(true);
                });
    }

    private AnimeReview findReviewOrThrow(Long reviewId, Long animeId) {
        AnimeReview review = animeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND));
        if (!review.getAnime().getId().equals(animeId)) {
            throw new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND);
        }
        return review;
    }
}
