package com.soaengry.geekyard.global.util;

import org.springframework.data.domain.PageRequest;

public final class PageRequestFactory {

    private static final int MAX_SIZE = 100;

    private PageRequestFactory() {
    }

    public static PageRequest of(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
        return PageRequest.of(safePage, safeSize);
    }
}
