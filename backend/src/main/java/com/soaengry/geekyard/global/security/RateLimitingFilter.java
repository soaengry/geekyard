package com.soaengry.geekyard.global.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * IP 기반 Rate Limiting 필터.
 * - /api/auth/login      : IP당 5회/분
 * - /api/auth/signup     : IP당 3회/분
 * - /api/auth/refresh    : IP당 10회/분
 */
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final String SIGNUP_PATH = "/api/auth/signup";
    private static final String REFRESH_PATH = "/api/auth/refresh";

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> signupBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> refreshBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (!"POST".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        Bucket bucket = resolveBucket(path, getClientIp(request));
        if (bucket == null) {
            filterChain.doFilter(request, response);
            return;
        }

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("""
                    {"status":{"code":"TOO_MANY_REQUESTS","message":"요청 횟수가 초과되었습니다. 잠시 후 다시 시도해주세요."}}
                    """);
        }
    }

    private Bucket resolveBucket(String path, String ip) {
        if (path.equals(LOGIN_PATH)) {
            return loginBuckets.computeIfAbsent(ip, k -> buildBucket(5, Duration.ofMinutes(1)));
        }
        if (path.equals(SIGNUP_PATH)) {
            return signupBuckets.computeIfAbsent(ip, k -> buildBucket(3, Duration.ofMinutes(1)));
        }
        if (path.equals(REFRESH_PATH)) {
            return refreshBuckets.computeIfAbsent(ip, k -> buildBucket(10, Duration.ofMinutes(1)));
        }
        return null;
    }

    private Bucket buildBucket(long capacity, Duration period) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(capacity, period)
                .build();
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
