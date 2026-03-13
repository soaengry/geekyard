package com.soaengry.geekyard.domain.anime.dto.response;

import java.math.BigDecimal;

public record ReviewStatsResponse(
        BigDecimal averageScore,
        Long totalCount
) {
}
