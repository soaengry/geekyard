package com.soaengry.geekyard.global.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soaengry.geekyard.global.common.ApiResponse;
import com.soaengry.geekyard.global.common.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        ErrorCode errorCode = ErrorCode.from("AUTH_UNAUTHORIZED", "인증이 필요합니다.", HttpStatus.UNAUTHORIZED);
        ApiResponse<?> body = ApiResponse.error(errorCode);

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
