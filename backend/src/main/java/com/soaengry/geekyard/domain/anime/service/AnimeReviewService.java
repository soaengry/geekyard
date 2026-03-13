package com.soaengry.geekyard.domain.anime.service;

import com.soaengry.geekyard.domain.anime.dto.request.CreateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.request.UpdateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewResponse;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewStatsResponse;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.entity.AnimeReview;
import com.soaengry.geekyard.domain.anime.exception.AnimeErrorCode;
import com.soaengry.geekyard.domain.anime.exception.AnimeException;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.anime.repository.AnimeReviewRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.util.NicknameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnimeReviewService {

    private final AnimeReviewRepository animeReviewRepository;
    private final AnimeRepository animeRepository;

    public Page<ReviewResponse> getReviews(Long animeId, Pageable pageable) {
        return animeReviewRepository.findByAnimeIdWithUser(animeId, pageable)
                .map(this::toResponse);
    }

    public ReviewStatsResponse getReviewStats(Long animeId) {
        List<Object[]> result = animeReviewRepository.findReviewStatsByAnimeId(animeId);
        Object[] row = result.get(0);
        Double avg = ((Number) row[0]).doubleValue();
        Long totalCount = ((Number) row[1]).longValue();
        return new ReviewStatsResponse(BigDecimal.valueOf(avg), totalCount);
    }

    public ReviewResponse getMyReview(Long animeId, User user) {
        return animeReviewRepository.findByAnimeIdAndUser(animeId, user)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public ReviewResponse createReview(Long animeId, User user, CreateReviewRequest request) {
        validateScoreStep(request.score());

        if (animeReviewRepository.existsByAnimeIdAndUser(animeId, user)) {
            throw new AnimeException(AnimeErrorCode.DUPLICATE_REVIEW);
        }

        Anime anime = animeRepository.findById(animeId)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.ANIME_NOT_FOUND));

        AnimeReview review = AnimeReview.create(anime, user, request.score(), request.content());
        animeReviewRepository.save(review);
        return toResponse(review);
    }

    @Transactional
    public ReviewResponse updateReview(Long animeId, Long reviewId, User user, UpdateReviewRequest request) {
        if (request.score() != null) {
            validateScoreStep(request.score());
        }

        AnimeReview review = findReviewOrThrow(reviewId, animeId);
        validateOwner(review, user);

        review.update(request.score(), request.content());
        return toResponse(review);
    }

    @Transactional
    public void deleteReview(Long animeId, Long reviewId, User user) {
        AnimeReview review = findReviewOrThrow(reviewId, animeId);
        validateOwner(review, user);
        animeReviewRepository.delete(review);
    }

    private ReviewResponse toResponse(AnimeReview review) {
        if (review.isSiteUser()) {
            User user = review.getUser();
            return ReviewResponse.from(review, user.getNickname(), user.getProfileImage());
        }
        String nickname = review.getExternalUsername() != null
                ? review.getExternalUsername()
                : NicknameGenerator.generate(review.getExternalUserId());
        return ReviewResponse.from(review, nickname, null);
    }

    private AnimeReview findReviewOrThrow(Long reviewId, Long animeId) {
        AnimeReview review = animeReviewRepository.findById(reviewId)
                .orElseThrow(() -> new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND));
        if (!review.getAnime().getId().equals(animeId)) {
            throw new AnimeException(AnimeErrorCode.REVIEW_NOT_FOUND);
        }
        return review;
    }

    private void validateOwner(AnimeReview review, User user) {
        if (!review.isSiteUser() || !review.getUser().getId().equals(user.getId())) {
            throw new AnimeException(AnimeErrorCode.REVIEW_UNAUTHORIZED);
        }
    }

    private void validateScoreStep(BigDecimal score) {
        BigDecimal step = new BigDecimal("0.50");
        if (score.remainder(step).compareTo(BigDecimal.ZERO) != 0) {
            throw new AnimeException(AnimeErrorCode.INVALID_SCORE);
        }
    }
}
