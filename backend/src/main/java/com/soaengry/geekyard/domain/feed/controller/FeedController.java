package com.soaengry.geekyard.domain.feed.controller;

import com.soaengry.geekyard.domain.feed.dto.request.CreateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.response.BookmarkResponse;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.domain.feed.dto.response.LikeResponse;
import com.soaengry.geekyard.domain.feed.service.FeedService;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/feeds")
@RequiredArgsConstructor
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FeedResponse>>> getFeeds(
            @RequestParam(required = false) Long animeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.FEED_LIST,
                feedService.getFeeds(animeId, PageRequest.of(page, size), user)
        ));
    }

    @GetMapping("/{feedId}")
    public ResponseEntity<ApiResponse<FeedResponse>> getFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.FEED_DETAIL,
                feedService.getFeed(feedId, user)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeedResponse>> createFeed(
            @AuthenticationPrincipal User user,
            @Valid @RequestPart("request") CreateFeedRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                SuccessCode.FEED_CREATED,
                feedService.createFeed(user, request, files)
        ));
    }

    @PatchMapping("/{feedId}")
    public ResponseEntity<ApiResponse<FeedResponse>> updateFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user,
            @Valid @RequestPart("request") UpdateFeedRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.FEED_UPDATED,
                feedService.updateFeed(feedId, user, request, files)
        ));
    }

    @DeleteMapping("/{feedId}")
    public ResponseEntity<ApiResponse<Void>> deleteFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        feedService.deleteFeed(feedId, user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.FEED_DELETED));
    }

    @PostMapping("/{feedId}/like")
    public ResponseEntity<ApiResponse<LikeResponse>> toggleLike(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.OK,
                feedService.toggleLike(feedId, user)
        ));
    }

    @PostMapping("/{feedId}/bookmark")
    public ResponseEntity<ApiResponse<BookmarkResponse>> toggleBookmark(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.OK,
                feedService.toggleBookmark(feedId, user)
        ));
    }
}
