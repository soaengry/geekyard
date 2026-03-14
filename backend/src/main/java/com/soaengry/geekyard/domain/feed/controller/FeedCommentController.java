package com.soaengry.geekyard.domain.feed.controller;

import com.soaengry.geekyard.domain.feed.dto.request.CreateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.service.FeedCommentService;
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
@RequestMapping("/api/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentService feedCommentService;

    @GetMapping
    @ApiSuccessCode(SuccessCode.OK)
    public Page<CommentResponse> getComments(
            @PathVariable Long feedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return feedCommentService.getComments(feedId, PageRequestFactory.of(page, size));
    }

    @PostMapping
    @ApiSuccessCode(SuccessCode.COMMENT_CREATED)
    public CommentResponse createComment(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return feedCommentService.createComment(feedId, user, request);
    }

    @PatchMapping("/{commentId}")
    @ApiSuccessCode(SuccessCode.COMMENT_UPDATED)
    public CommentResponse updateComment(
            @PathVariable Long feedId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        return feedCommentService.updateComment(feedId, commentId, user, request);
    }

    @DeleteMapping("/{commentId}")
    @ApiSuccessCode(SuccessCode.COMMENT_DELETED)
    public Void deleteComment(
            @PathVariable Long feedId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user
    ) {
        feedCommentService.deleteComment(feedId, commentId, user);
        return null;
    }
}
