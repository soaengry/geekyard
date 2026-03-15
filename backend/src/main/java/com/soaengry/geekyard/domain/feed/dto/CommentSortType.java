package com.soaengry.geekyard.domain.feed.dto;

public enum CommentSortType {
    LATEST,
    POPULAR;

    public static CommentSortType from(String value) {
        if (value == null) return LATEST;
        try {
            return valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return LATEST;
        }
    }
}
