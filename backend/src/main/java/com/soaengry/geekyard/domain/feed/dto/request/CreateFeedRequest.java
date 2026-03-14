package com.soaengry.geekyard.domain.feed.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateFeedRequest(
        @NotNull(message = "애니메이션 ID는 필수입니다.")
        Long animeId,

        @NotBlank(message = "피드 내용은 필수입니다.")
        @Size(max = 5000, message = "피드 내용은 5000자 이내로 작성해주세요.")
        String content
) {}
