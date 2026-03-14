package com.soaengry.geekyard.domain.feed.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FeedErrorCode {
    FEED_NOT_FOUND("존재하지 않는 피드입니다."),
    FEED_UNAUTHORIZED("피드 수정/삭제 권한이 없습니다."),
    COMMENT_NOT_FOUND("존재하지 않는 댓글입니다."),
    COMMENT_UNAUTHORIZED("댓글 수정/삭제 권한이 없습니다.");

    private final String message;
}
