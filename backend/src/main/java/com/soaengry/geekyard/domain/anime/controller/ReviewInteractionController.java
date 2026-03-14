package com.soaengry.geekyard.domain.anime.controller;

import com.soaengry.geekyard.domain.anime.service.ReviewInteractionService;
import com.soaengry.geekyard.global.common.dto.BookmarkResponse;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/anime/{animeId}/reviews/{reviewId}")
@RequiredArgsConstructor
public class ReviewInteractionController {

    private final ReviewInteractionService reviewInteractionService;

    @PostMapping("/like")
    @ApiSuccessCode(SuccessCode.OK)
    public LikeResponse toggleLike(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        return reviewInteractionService.toggleLike(animeId, reviewId, user);
    }

    @PostMapping("/bookmark")
    @ApiSuccessCode(SuccessCode.OK)
    public BookmarkResponse toggleBookmark(
            @PathVariable Long animeId,
            @PathVariable Long reviewId,
            @AuthenticationPrincipal User user
    ) {
        return reviewInteractionService.toggleBookmark(animeId, reviewId, user);
    }
}
