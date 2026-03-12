package com.soaengry.geekyard.global.common;

import org.springframework.http.HttpStatus;

public record ErrorCode(int code, String message, HttpStatus httpStatus) {

    public static ErrorCode from(String name, String message, HttpStatus httpStatus) {
        return new ErrorCode(httpStatus.value(), message, httpStatus);
    }
}
