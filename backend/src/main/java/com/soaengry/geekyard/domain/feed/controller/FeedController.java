package com.soaengry.geekyard.domain.feed.controller;

import com.soaengry.geekyard.domain.feed.dto.request.CreateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateFeedRequest;
import com.soaengry.geekyard.domain.feed.dto.response.FeedResponse;
import com.soaengry.geekyard.global.common.dto.BookmarkResponse;
import com.soaengry.geekyard.global.common.dto.LikeResponse;
import com.soaengry.geekyard.domain.feed.service.FeedService;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.ApiSuccessCode;
import com.soaengry.geekyard.global.common.SuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.soaengry.geekyard.global.util.PageRequestFactory;
import org.springframework.data.domain.Page;
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
    @ApiSuccessCode(SuccessCode.FEED_LIST)
    public Page<FeedResponse> getFeeds(
            @RequestParam(required = false) Long animeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user
    ) {
        return feedService.getFeeds(animeId, PageRequestFactory.of(page, size), user);
    }

    @GetMapping("/{feedId}")
    @ApiSuccessCode(SuccessCode.FEED_DETAIL)
    public FeedResponse getFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return feedService.getFeed(feedId, user);
    }

    @PostMapping
    @ApiSuccessCode(SuccessCode.FEED_CREATED)
    public FeedResponse createFeed(
            @AuthenticationPrincipal User user,
            @Valid @RequestPart("request") CreateFeedRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        return feedService.createFeed(user, request, files);
    }

    @PatchMapping("/{feedId}")
    @ApiSuccessCode(SuccessCode.FEED_UPDATED)
    public FeedResponse updateFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user,
            @Valid @RequestPart("request") UpdateFeedRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files
    ) throws IOException {
        return feedService.updateFeed(feedId, user, request, files);
    }

    @DeleteMapping("/{feedId}")
    @ApiSuccessCode(SuccessCode.FEED_DELETED)
    public Void deleteFeed(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        feedService.deleteFeed(feedId, user);
        return null;
    }

    @PostMapping("/{feedId}/like")
    @ApiSuccessCode(SuccessCode.OK)
    public LikeResponse toggleLike(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return feedService.toggleLike(feedId, user);
    }

    @PostMapping("/{feedId}/bookmark")
    @ApiSuccessCode(SuccessCode.OK)
    public BookmarkResponse toggleBookmark(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user
    ) {
        return feedService.toggleBookmark(feedId, user);
    }
}
