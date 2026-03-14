package com.soaengry.geekyard.domain.feed.dto.request;

import jakarta.validation.constraints.Size;

public record UpdateFeedRequest(
        @Size(max = 5000, message = "피드 내용은 5000자 이내로 작성해주세요.")
        String content
) {}
