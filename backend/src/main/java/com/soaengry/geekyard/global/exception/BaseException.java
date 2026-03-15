package com.soaengry.geekyard.global.exception;

public abstract class BaseException extends RuntimeException {

    public BaseException(String message) {
        super(message);
    }

    public abstract String getErrorCodeName();
}
