package com.soaengry.geekyard.domain.anime.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateReviewRequest(
        @NotNull(message = "별점은 필수입니다.")
        @DecimalMin(value = "0.50", message = "별점은 0.5 이상이어야 합니다.")
        @DecimalMax(value = "5.00", message = "별점은 5.0 이하여야 합니다.")
        BigDecimal score,

        @Size(max = 2000, message = "리뷰는 2000자 이내로 작성해주세요.")
        String content
) {
}
