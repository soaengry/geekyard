package com.soaengry.geekyard.domain.user.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record WatchedStatisticsResponse(
        List<MonthlyCount> monthlyCounts,
        List<GenreRatio> genreRatios,
        List<GenreAvgRating> genreAvgRatings
) {
    public record MonthlyCount(String month, long count) {}
    public record GenreRatio(String genre, long count) {}
    public record GenreAvgRating(String genre, BigDecimal avgRating) {}
}
