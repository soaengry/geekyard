package com.soaengry.geekyard.global.security.oauth2;

import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.security.jwt.JwtProvider;
import com.soaengry.geekyard.global.service.RedisService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    @Value("${oauth2.redirect-uri:http://localhost:3000/oauth2/callback}")
    private String redirectUri;

    private final JwtProvider jwtProvider;
    private final RedisService redisService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        User user = ((CustomOAuth2User) authentication.getPrincipal()).getUser();

        String accessToken = jwtProvider.generateAccessToken(user.getId(), user.getTokenVersion());
        String refreshToken = jwtProvider.generateRefreshToken(user.getId(), user.getTokenVersion());
        redisService.saveRefreshToken(user.getId(), refreshToken, REFRESH_TOKEN_TTL);

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
