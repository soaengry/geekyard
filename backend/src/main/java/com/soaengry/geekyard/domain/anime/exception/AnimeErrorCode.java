package com.soaengry.geekyard.domain.anime.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AnimeErrorCode {
    ANIME_NOT_FOUND("존재하지 않는 애니메이션입니다."),
    REVIEW_NOT_FOUND("존재하지 않는 리뷰입니다."),
    DUPLICATE_REVIEW("이미 작성한 리뷰가 있습니다."),
    REVIEW_UNAUTHORIZED("리뷰 수정/삭제 권한이 없습니다."),
    INVALID_SCORE("별점은 0.5 단위로 입력해주세요.");

    private final String message;
}
