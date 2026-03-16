package com.soaengry.geekyard.domain.chat.entity;

import com.soaengry.geekyard.domain.anime.entity.Anime;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_messages_anime_created", columnList = "anime_id, created_at DESC")
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class ChatMessage extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anime_id", nullable = false)
    private Anime anime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Builder
    private ChatMessage(Anime anime, User user, String message) {
        this.anime = anime;
        this.user = user;
        this.message = message;
    }

    public static ChatMessage create(Anime anime, User user, String message) {
        return ChatMessage.builder()
                .anime(anime)
                .user(user)
                .message(message)
                .build();
    }
}
