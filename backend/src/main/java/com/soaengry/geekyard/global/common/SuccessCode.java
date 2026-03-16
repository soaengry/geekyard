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
    EMAIL_VERIFIED(200, "이메일 인증이 완료되었습니다."),
    ANIME_LIST(200, "애니메이션 목록을 조회했습니다."),
    ANIME_DETAIL(200, "애니메이션 상세 정보를 조회했습니다."),
    REVIEW_LIST(200, "리뷰 목록을 조회했습니다."),
    REVIEW_CREATED(201, "리뷰가 등록되었습니다."),
    REVIEW_UPDATED(200, "리뷰가 수정되었습니다."),
    REVIEW_DELETED(200, "리뷰가 삭제되었습니다."),
    FEED_LIST(200, "피드 목록을 조회했습니다."),
    FEED_DETAIL(200, "피드 상세 정보를 조회했습니다."),
    FEED_CREATED(201, "피드가 등록되었습니다."),
    FEED_UPDATED(200, "피드가 수정되었습니다."),
    FEED_DELETED(200, "피드가 삭제되었습니다."),
    COMMENT_CREATED(201, "댓글이 등록되었습니다."),
    COMMENT_UPDATED(200, "댓글이 수정되었습니다."),
    COMMENT_DELETED(200, "댓글이 삭제되었습니다."),
    ANIME_COLLECTION_LIST(200, "애니메이션 컬렉션 목록을 조회했습니다."),
    ANIME_COLLECTION_DETAIL(200, "애니메이션 컬렉션 상세 정보를 조회했습니다."),
    ANIME_COLLECTION_CREATED(201, "애니메이션 컬렉션이 생성되었습니다."),
    SIMILAR_ANIME_LIST(200, "비슷한 애니메이션을 조회했습니다."),
    CHAT_MESSAGES(200, "채팅 메시지를 조회했습니다.");

    private final int code;
    private final String message;
}
