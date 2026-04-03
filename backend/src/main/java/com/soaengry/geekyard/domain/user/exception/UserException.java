package com.soaengry.geekyard.domain.user.exception;

import com.soaengry.geekyard.global.exception.BaseException;
import lombok.Getter;

@Getter
public class UserException extends BaseException {

    private final UserErrorCode errorCode;

    public UserException(UserErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    @Override
    public String getErrorCodeName() {
        return errorCode.name();
    }
}
