package com.soaengry.geekyard.domain.anime.entity;

import com.soaengry.geekyard.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "user_genre_preferences", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "genre"})
})
@Getter
@NoArgsConstructor(access = PROTECTED)
public class UserGenrePreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "genre", nullable = false)
    private String genre;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public static UserGenrePreference create(User user, String genre) {
        UserGenrePreference preference = new UserGenrePreference();
        preference.user = user;
        preference.genre = genre;
        return preference;
    }
}
