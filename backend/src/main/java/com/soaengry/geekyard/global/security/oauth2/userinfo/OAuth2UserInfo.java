package com.soaengry.geekyard.global.security.oauth2.userinfo;

public interface OAuth2UserInfo {
    String getEmail();
    String getNickname();
    String getProfileImage();
}
