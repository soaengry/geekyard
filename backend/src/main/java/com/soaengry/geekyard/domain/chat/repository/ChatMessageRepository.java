package com.soaengry.geekyard.domain.chat.repository;

import com.soaengry.geekyard.domain.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findTop50ByAnimeIdOrderByCreatedAtDesc(Long animeId);
}
