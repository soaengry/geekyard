package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.dto.request.CreateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.request.UpdateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewResponse;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewStatsResponse;
import com.soaengry.geekyard.domain.anime.service.AnimeReviewService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.soaengry.geekyard.global.util.PageRequestFactory;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/anime/{animeId}/reviews")
@RequiredArgsConstructor
public class AnimeReviewController {

    private final AnimeReviewService animeReviewService;

    @GetMapping
    @ApiSuccessCode(SuccessCode.REVIEW_LIST)
    public Page<ReviewResponse> getReviews(
            @PathVariable Long animeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return animeReviewService.getReviews(animeId, PageRequestFactory.of(page, size), user);
    }

    @GetMapping("/stats")
    @ApiSuccessCode(SuccessCode.REVIEW_LIST)
    public ReviewStatsResponse getReviewStats(@PathVariable Long animeId) {
        return animeReviewService.getReviewStats(animeId);
    }

    @GetMapping("/mine")
    @ApiSuccessCode(SuccessCode.REVIEW_LIST)
    public ReviewResponse getMyReview(
            @PathVariable Long animeId,
            @AuthenticationPrincipal User user
    ) {
        return animeReviewService.getMyReview(animeId, user);
    }

    @PostMapping
    @ApiSuccessCode(SuccessCode.REVIEW_CREATED)
    public ReviewResponse createReview(
            @PathVariable Long animeId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        return animeReviewService.createReview(animeId, user, request);
    }

    @PatchMapping("/{reviewId}")
    @ApiSuccessCode(SuccessCode.REVIEW_UPDATED)
    public ReviewResponse updateReview(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        return animeReviewService.updateReview(animeId, reviewId, user, request);
    }

    @DeleteMapping("/{reviewId}")
    @ApiSuccessCode(SuccessCode.REVIEW_DELETED)
    public Void deleteReview(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        animeReviewService.deleteReview(animeId, reviewId, user);
        return null;
    }
}
