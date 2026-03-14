package com.soaengry.geekyard.domain.feed.dto.response;

public record LikeResponse(
        boolean liked,
        Integer likeCount
) {}
