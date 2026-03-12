package com.soaengry.geekyard.global.security.oauth2;

import com.soaengry.geekyard.domain.user.entity.AuthProvider;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.repository.UserRepository;
import com.soaengry.geekyard.global.security.oauth2.userinfo.GoogleOAuth2UserInfo;
import com.soaengry.geekyard.global.security.oauth2.userinfo.KakaoOAuth2UserInfo;
import com.soaengry.geekyard.global.security.oauth2.userinfo.NaverOAuth2UserInfo;
import com.soaengry.geekyard.global.security.oauth2.userinfo.OAuth2UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo userInfo = resolveUserInfo(registrationId, oAuth2User);

        User user = processUser(userInfo, registrationId);
        return new CustomOAuth2User(user, oAuth2User.getAttributes());
    }

    private OAuth2UserInfo resolveUserInfo(String registrationId, OAuth2User oAuth2User) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> new GoogleOAuth2UserInfo(oAuth2User.getAttributes());
            case "kakao"  -> new KakaoOAuth2UserInfo(oAuth2User.getAttributes());
            case "naver"  -> new NaverOAuth2UserInfo(oAuth2User.getAttributes());
            default -> throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        };
    }

    private User processUser(OAuth2UserInfo userInfo, String registrationId) {
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        return userRepository.findByEmail(userInfo.getEmail())
                .map(existing -> {
                    existing.update(userInfo.getNickname(), null);
                    return existing;
                })
                .orElseGet(() -> userRepository.save(
                        User.createOAuth(userInfo.getEmail(), generateUsername(userInfo.getEmail()),
                                userInfo.getNickname(), provider)
                ));
    }

    private String generateUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "_");
        String candidate = base;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + "_" + UUID.randomUUID().toString().substring(0, 6);
        }
        return candidate;
    }
}
