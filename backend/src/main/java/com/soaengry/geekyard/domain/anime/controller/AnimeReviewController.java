package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.dto.request.CreateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.request.UpdateReviewRequest;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewResponse;
import com.soaengry.geekyard.domain.anime.dto.response.ReviewStatsResponse;
import com.soaengry.geekyard.domain.anime.service.AnimeReviewService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/anime/{animeId}/reviews")
@RequiredArgsConstructor
public class AnimeReviewController {

    private final AnimeReviewService animeReviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviews(
            @PathVariable Long animeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        Page<ReviewResponse> reviews = animeReviewService.getReviews(animeId, PageRequest.of(page, size), user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.REVIEW_LIST, reviews));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ReviewStatsResponse>> getReviewStats(@PathVariable Long animeId) {
        ReviewStatsResponse stats = animeReviewService.getReviewStats(animeId);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.REVIEW_LIST, stats));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<ReviewResponse>> getMyReview(
            @PathVariable Long animeId,
            @AuthenticationPrincipal User user
    ) {
        ReviewResponse review = animeReviewService.getMyReview(animeId, user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.REVIEW_LIST, review));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @PathVariable Long animeId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        ReviewResponse review = animeReviewService.createReview(animeId, user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(SuccessCode.REVIEW_CREATED, review));
    }

    @PatchMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        ReviewResponse review = animeReviewService.updateReview(animeId, reviewId, user, request);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.REVIEW_UPDATED, review));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        animeReviewService.deleteReview(animeId, reviewId, user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.REVIEW_DELETED));
    }
}
