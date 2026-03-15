package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewFinder {

    private final AnimeReviewRepository animeReviewRepository;

    public AnimeReview findOrThrow(Long reviewId, Long animeId) {
        AnimeReview review = animeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND));
        if (!review.getAnime().getId().equals(animeId)) {
            throw new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND);
        }
        return review;
    }
}
