package com.soaengry.geekyard.domain.animelist.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum AnimeListErrorCode {
    ANIME_LIST_NOT_FOUND("존재하지 않는 애니메이션 리스트입니다."),
    ANIME_LIST_UNAUTHORIZED("리스트 수정/삭제 권한이 없습니다."),
    DUPLICATE_ANIME_IN_LIST("이미 리스트에 추가된 애니메이션입니다."),
    ANIME_LIST_ITEM_NOT_FOUND("리스트에 존재하지 않는 애니메이션입니다.");

    private final String message;
}
