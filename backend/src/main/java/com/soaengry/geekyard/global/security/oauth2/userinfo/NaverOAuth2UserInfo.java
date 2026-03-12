package com.soaengry.geekyard.global.security.oauth2.userinfo;

import java.util.Map;

@SuppressWarnings("unchecked")
public class NaverOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public NaverOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getEmail() {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) return null;
        return (String) response.get("email");
    }

    @Override
    public String getNickname() {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) return null;
        return (String) response.get("nickname");
    }

    @Override
    public String getProfileImage() {
        Map<String, Object> response = (Map<String, Object>) attributes.get("response");
        if (response == null) return null;
        return (String) response.get("profile_image");
    }
}
