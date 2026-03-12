package com.soaengry.geekyard.global.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    OK(200, "OK"),
    CREATED(201, "Created"),
    UPDATED(200, "Updated"),
    DELETED(200, "Deleted"),
    SIGNUP(201, "회원가입이 완료되었습니다."),
    LOGIN(200, "로그인이 완료되었습니다."),
    LOGOUT(200, "로그아웃이 완료되었습니다."),
    TOKEN_REFRESHED(200, "토큰이 갱신되었습니다."),
    PASSWORD_CHANGED(200, "비밀번호가 변경되었습니다."),
    PROFILE_UPDATED(200, "프로필이 수정되었습니다."),
    ACCOUNT_DELETED(200, "계정이 삭제되었습니다."),
    ACCOUNT_RECOVERED(200, "계정이 복구되었습니다."),
    VERIFICATION_EMAIL_SENT(200, "인증 메일이 발송되었습니다."),
    EMAIL_VERIFIED(200, "이메일 인증이 완료되었습니다.");

    private final int code;
    private final String message;
}
