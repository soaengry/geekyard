package com.soaengry.geekyard.domain.chat.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.anime.repository.AnimeRepository;
import com.soaengry.geekyard.domain.chat.dto.request.ChatMessageRequest;
import com.soaengry.geekyard.domain.chat.dto.response.ChatMessageResponse;
import com.soaengry.geekyard.domain.chat.entity.ChatMessage;
import com.soaengry.geekyard.domain.chat.repository.ChatMessageRepository;
import com.soaengry.geekyard.domain.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatService {

    private static final String CACHE_PREFIX = "chat:room:";
    private static final int MAX_CACHE_SIZE = 50;
    private static final Duration CACHE_TTL = Duration.ofHours(1);

    private final ChatMessageRepository chatMessageRepository;
    private final AnimeRepository animeRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public List<ChatMessageResponse> getRecentMessages(Long animeId) {
        String cacheKey = CACHE_PREFIX + animeId;
        String cached = redisTemplate.opsForValue().get(cacheKey);

        if (cached != null) {
            try {
                return objectMapper.readValue(cached, new TypeReference<>() {});
            } catch (Exception e) {
                log.warn("Failed to deserialize chat cache for anime {}", animeId, e);
            }
        }

        List<ChatMessage> messages = new ArrayList<>(chatMessageRepository.findTop50ByAnimeIdOrderByCreatedAtDesc(animeId));
        Collections.reverse(messages);
        List<ChatMessageResponse> responses = messages.stream()
                .map(ChatMessageResponse::from)
                .toList();

        cacheMessages(cacheKey, responses);
        return responses;
    }

    @Transactional
    public ChatMessageResponse saveMessage(ChatMessageRequest request, User user) {
        Anime anime = animeRepository.findById(request.animeId())
                .orElseThrow(() -> new IllegalArgumentException("Anime not found: " + request.animeId()));

        ChatMessage chatMessage = ChatMessage.create(anime, user, request.message());
        chatMessageRepository.save(chatMessage);

        ChatMessageResponse response = ChatMessageResponse.from(chatMessage);

        updateCache(request.animeId(), response);

        return response;
    }

    private void updateCache(Long animeId, ChatMessageResponse newMessage) {
        String cacheKey = CACHE_PREFIX + animeId;
        String cached = redisTemplate.opsForValue().get(cacheKey);

        try {
            List<ChatMessageResponse> messages;
            if (cached != null) {
                messages = new ArrayList<>(objectMapper.readValue(cached, new TypeReference<>() {}));
            } else {
                messages = new ArrayList<>();
            }
            messages.add(newMessage);
            if (messages.size() > MAX_CACHE_SIZE) {
                messages = new ArrayList<>(messages.subList(messages.size() - MAX_CACHE_SIZE, messages.size()));
            }
            cacheMessages(cacheKey, messages);
        } catch (Exception e) {
            log.warn("Failed to update chat cache for anime {}", animeId, e);
            redisTemplate.delete(cacheKey);
        }
    }

    private void cacheMessages(String cacheKey, List<ChatMessageResponse> messages) {
        try {
            String json = objectMapper.writeValueAsString(messages);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL);
        } catch (Exception e) {
            log.warn("Failed to cache chat messages", e);
        }
    }
}
