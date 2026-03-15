package com.soaengry.geekyard.domain.user.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode {
    DUPLICATE_EMAIL("이미 사용 중인 이메일입니다."),
    DUPLICATE_USERNAME("이미 사용 중인 사용자명입니다."),
    USER_NOT_FOUND("존재하지 않는 사용자입니다."),
    AUTH_INVALID_CREDENTIALS("이메일 또는 비밀번호가 올바르지 않습니다."),
    AUTH_TOKEN_EXPIRED("토큰이 만료되었습니다."),
    AUTH_INVALID_TOKEN("유효하지 않은 토큰입니다."),
    INVALID_PASSWORD("비밀번호가 올바르지 않습니다."),
    UNAUTHORIZED_ACCESS("접근 권한이 없습니다."),
    ACCOUNT_RECOVERY_PERIOD_EXPIRED("계정 복구 기간(30일)이 초과되었습니다."),
    ACCOUNT_NOT_DELETED("삭제되지 않은 계정입니다."),
    OAUTH_ACCOUNT("소셜 로그인 계정입니다. 카카오, 네이버, 구글 로그인을 이용해주세요."),
    EMAIL_ALREADY_VERIFIED("이미 인증된 이메일입니다."),
    VERIFICATION_TOKEN_INVALID("유효하지 않은 인증 링크입니다."),
    VERIFICATION_TOKEN_EXPIRED("만료된 인증 링크입니다.");

    private final String message;
}
