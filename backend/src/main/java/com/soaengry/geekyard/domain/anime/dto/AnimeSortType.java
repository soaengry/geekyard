package com.soaengry.geekyard.domain.anime.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AnimeSortType {

    POPULAR("(a.view_count + a.review_count + a.feed_count) DESC"),
    LATEST("a.latest_episode_release_datetime DESC NULLS LAST"),
    REVIEWCOUNT("a.review_count DESC"),
    RATING("a.avg_rating DESC NULLS LAST, a.review_count DESC");

    private final String sql;

    public static AnimeSortType from(String value) {
        if (value == null) return POPULAR;
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return POPULAR;
        }
    }
}
