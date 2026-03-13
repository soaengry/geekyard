package com.soaengry.geekyard.domain.anime.exception;

import lombok.Getter;

@Getter
public class AnimeException extends RuntimeException {

    private final AnimeErrorCode errorCode;

    public AnimeException(AnimeErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
