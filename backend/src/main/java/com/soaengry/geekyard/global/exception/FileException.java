package com.soaengry.geekyard.global.exception;

import lombok.Getter;

@Getter
public class FileException extends BaseException {

    private final FileErrorCode errorCode;

    public FileException(FileErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    @Override
    public String getErrorCodeName() {
        return errorCode.name();
    }
}
