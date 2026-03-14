package com.soaengry.geekyard.domain.feed.controller;

import com.soaengry.geekyard.domain.feed.dto.request.CreateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.request.UpdateCommentRequest;
import com.soaengry.geekyard.domain.feed.dto.response.CommentResponse;
import com.soaengry.geekyard.domain.feed.service.FeedCommentService;
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
@RequestMapping("/api/feeds/{feedId}/comments")
@RequiredArgsConstructor
public class FeedCommentController {

    private final FeedCommentService feedCommentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long feedId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.OK,
                feedCommentService.getComments(feedId, PageRequest.of(page, size))
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long feedId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateCommentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                SuccessCode.COMMENT_CREATED,
                feedCommentService.createComment(feedId, user, request)
        ));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long feedId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateCommentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                SuccessCode.COMMENT_UPDATED,
                feedCommentService.updateComment(feedId, commentId, user, request)
        ));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long feedId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal User user
    ) {
        feedCommentService.deleteComment(feedId, commentId, user);
        return ResponseEntity.ok(ApiResponse.ok(SuccessCode.COMMENT_DELETED));
    }
}
