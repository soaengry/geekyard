package com.soaengry.geekyard.global.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * Redis Hash 구조로 RefreshToken 관리.
 * Key: refresh:{userId}  Type: Hash
 * Field: {deviceId}  Value: {hashedToken}
 *
 * KEYS 명령(O(N) 블로킹) 대신 HGETALL(O(M), M=디바이스 수≤5)를 사용하여
 * Redis 서버 블로킹 문제를 제거한다.
 */
@Service
@RequiredArgsConstructor
public class RedisService {

    private static final String REFRESH_TOKEN_PREFIX = "refresh:";

    @Value("${app.security.max-devices-per-user:5}")
    private int maxDevices;

    private final RedisTemplate<String, String> redisTemplate;

    /**
     * RefreshToken을 저장합니다. 최대 5대 디바이스 제한.
     * @return 생성된 deviceId
     */
    public String saveRefreshToken(Long userId, String rawRefreshToken, Duration ttl) {
        String deviceId = UUID.randomUUID().toString();
        String hashKey = buildHashKey(userId);
        String hashedToken = sha256(rawRefreshToken);

        enforceDeviceLimit(userId, hashKey);

        redisTemplate.opsForHash().put(hashKey, deviceId, hashedToken);
        redisTemplate.expire(hashKey, ttl);
        return deviceId;
    }

    /**
     * RefreshToken 검증 (userId의 모든 디바이스 탐색)
     */
    public boolean validateRefreshToken(Long userId, String rawRefreshToken) {
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(buildHashKey(userId));
        if (entries.isEmpty()) return false;

        String hashedToken = sha256(rawRefreshToken);
        return entries.values().stream().anyMatch(hashedToken::equals);
    }

    /**
     * 특정 RefreshToken에 대응하는 deviceId를 찾아 삭제 (로그아웃)
     */
    public void deleteRefreshToken(Long userId, String rawRefreshToken) {
        String hashKey = buildHashKey(userId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(hashKey);
        if (entries.isEmpty()) return;

        String hashedToken = sha256(rawRefreshToken);
        entries.entrySet().stream()
                .filter(e -> hashedToken.equals(e.getValue()))
                .map(e -> e.getKey().toString())
                .findFirst()
                .ifPresent(deviceId -> redisTemplate.opsForHash().delete(hashKey, deviceId));
    }

    /**
     * 해당 유저의 모든 RefreshToken 삭제 (비밀번호 변경, 탈퇴 등)
     */
    public void deleteAllRefreshTokens(Long userId) {
        redisTemplate.delete(buildHashKey(userId));
    }

    private void enforceDeviceLimit(Long userId, String hashKey) {
        Long size = redisTemplate.opsForHash().size(hashKey);
        if (size == null || size < maxDevices) return;

        // TTL 기준으로 가장 오래된 deviceId 제거 — Hash TTL은 키 단위이므로
        // 저장 순서를 기준으로 첫 번째 필드를 제거한다 (FIFO).
        redisTemplate.opsForHash().entries(hashKey).keySet().stream()
                .map(Object::toString)
                .min(Comparator.naturalOrder())
                .ifPresent(oldestDeviceId ->
                        redisTemplate.opsForHash().delete(hashKey, oldestDeviceId));
    }

    private String buildHashKey(Long userId) {
        return REFRESH_TOKEN_PREFIX + userId;
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
