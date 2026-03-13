package com.soaengry.geekyard.domain.anime.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AnimeErrorCode {
    ANIME_NOT_FOUND("존재하지 않는 애니메이션입니다.");

    private final String message;
}
