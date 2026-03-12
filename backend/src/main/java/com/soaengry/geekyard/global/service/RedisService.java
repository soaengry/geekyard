package com.soaengry.geekyard.global.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RedisService {

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final int MAX_DEVICES = 5;
    private final RedisTemplate<String, String> redisTemplate;

    /**
     * RefreshToken을 저장합니다. 최대 5대 디바이스 제한.
     * @return 생성된 deviceId
     */
    public String saveRefreshToken(Long userId, String rawRefreshToken, Duration ttl) {
        String deviceId = UUID.randomUUID().toString();
        String key = buildKey(userId, deviceId);
        String hashedToken = sha256(rawRefreshToken);

        enforceDeviceLimit(userId);

        redisTemplate.opsForValue().set(key, hashedToken, ttl);
        return deviceId;
    }

    /**
     * RefreshToken 검증 (deviceId 없이 userId로 모든 디바이스 탐색)
     */
    public boolean validateRefreshToken(Long userId, String rawRefreshToken) {
        Set<String> keys = redisTemplate.keys(REFRESH_TOKEN_PREFIX + userId + ":*");
        if (keys == null || keys.isEmpty()) return false;

        String hashedToken = sha256(rawRefreshToken);
        for (String key : keys) {
            String stored = redisTemplate.opsForValue().get(key);
            if (hashedToken.equals(stored)) return true;
        }
        return false;
    }

    /**
     * 특정 RefreshToken에 대응하는 키를 찾아 삭제 (로그아웃)
     */
    public void deleteRefreshToken(Long userId, String rawRefreshToken) {
        Set<String> keys = redisTemplate.keys(REFRESH_TOKEN_PREFIX + userId + ":*");
        if (keys == null || keys.isEmpty()) return;

        String hashedToken = sha256(rawRefreshToken);
        for (String key : keys) {
            String stored = redisTemplate.opsForValue().get(key);
            if (hashedToken.equals(stored)) {
                redisTemplate.delete(key);
                return;
            }
        }
    }

    /**
     * 해당 유저의 모든 RefreshToken 삭제 (비밀번호 변경, 탈퇴 등)
     */
    public void deleteAllRefreshTokens(Long userId) {
        Set<String> keys = redisTemplate.keys(REFRESH_TOKEN_PREFIX + userId + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    private void enforceDeviceLimit(Long userId) {
        Set<String> keys = redisTemplate.keys(REFRESH_TOKEN_PREFIX + userId + ":*");
        if (keys == null || keys.size() < MAX_DEVICES) return;

        // TTL 기준으로 가장 오래된 (TTL이 가장 짧은) 키 삭제
        List<String> sortedKeys = keys.stream()
                .sorted(Comparator.comparingLong(k -> {
                    Long ttl = redisTemplate.getExpire(k);
                    return ttl != null ? ttl : Long.MAX_VALUE;
                }))
                .toList();

        redisTemplate.delete(sortedKeys.get(0));
    }

    private String buildKey(Long userId, String deviceId) {
        return REFRESH_TOKEN_PREFIX + userId + ":" + deviceId;
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }
}
