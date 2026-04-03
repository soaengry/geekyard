package com.soaengry.geekyard.domain.feed.exception;

import com.soaengry.geekyard.global.exception.BaseException;
import lombok.Getter;

@Getter
public class FeedException extends BaseException {

    private final FeedErrorCode errorCode;

    public FeedException(FeedErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    @Override
    public String getErrorCodeName() {
        return errorCode.name();
    }
}
