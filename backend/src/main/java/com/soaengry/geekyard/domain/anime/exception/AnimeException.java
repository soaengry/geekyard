package com.soaengry.geekyard.domain.anime.exception;

import com.soaengry.geekyard.global.exception.BaseException;
import lombok.Getter;

@Getter
public class AnimeException extends BaseException {

    private final AnimeErrorCode errorCode;

    public AnimeException(AnimeErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    @Override
    public String getErrorCodeName() {
        return errorCode.name();
    }
}
