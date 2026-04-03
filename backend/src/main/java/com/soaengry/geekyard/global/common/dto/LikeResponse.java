package com.soaengry.geekyard.global.common.dto;

public record LikeResponse(
        boolean liked,
        Integer likeCount
) {}
