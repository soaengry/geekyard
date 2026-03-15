package com.soaengry.geekyard.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FileErrorCode {
    FILE_TOO_LARGE("파일 크기는 10MB 이하이어야 합니다."),
    INVALID_FILE_TYPE("지원하지 않는 파일 형식입니다. (jpeg, jpg, png, webp만 허용)");

    private final String message;
}
