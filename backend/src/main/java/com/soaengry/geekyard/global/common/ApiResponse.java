package com.soaengry.geekyard.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(ApiStatus status, T data) {

    public static <T> ApiResponse<T> ok(SuccessCode successCode, T data) {
        return new ApiResponse<>(new ApiStatus(successCode.getCode(), successCode.getMessage()), data);
    }

    public static ApiResponse<Void> ok(SuccessCode successCode) {
        return new ApiResponse<>(new ApiStatus(successCode.getCode(), successCode.getMessage()), null);
    }

    public static ApiResponse<Void> error(ErrorCode errorCode) {
        return new ApiResponse<>(new ApiStatus(errorCode.code(), errorCode.message()), null);
    }
}
