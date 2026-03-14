package com.soaengry.geekyard.domain.feed.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateCommentRequest(
        @Size(max = 1000, message = "댓글은 1000자 이내로 작성해주세요.")
        String content
) {}
