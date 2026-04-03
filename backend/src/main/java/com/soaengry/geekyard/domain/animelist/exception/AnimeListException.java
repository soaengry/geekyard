package com.soaengry.geekyard.domain.animelist.exception;

import com.soaengry.geekyard.global.exception.BaseException;
import lombok.Getter;

@Getter
public class AnimeListException extends BaseException {

    private final AnimeListErrorCode errorCode;

    public AnimeListException(AnimeListErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    @Override
    public String getErrorCodeName() {
        return errorCode.name();
    }
}
