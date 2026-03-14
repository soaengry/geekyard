package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.service.ReviewInteractionService;
import com.soaengry.geekyard.domain.feed.dto.response.BookmarkResponse;
import com.soaengry.geekyard.domain.feed.dto.response.LikeResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/anime/{animeId}/reviews/{reviewId}")
@RequiredArgsConstructor
public class ReviewInteractionController {

    private final ReviewInteractionService reviewInteractionService;

    @PostMapping("/like")
    public ResponseEntity<ApiResponse<LikeResponse>> toggleLike(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.OK,
                reviewInteractionService.toggleLike(animeId, reviewId, user)
        ));
    }

    @PostMapping("/bookmark")
    public ResponseEntity<ApiResponse<BookmarkResponse>> toggleBookmark(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.OK,
                reviewInteractionService.toggleBookmark(animeId, reviewId, user)
        ));
    }
}
