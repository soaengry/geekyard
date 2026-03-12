package com.soaengry.geekyard.domain.user.entity;

import com.soaengry.geekyard.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import static lombok.AccessLevel.PROTECTED;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = PROTECTED)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String nickname;

    private String password;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profileImage;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @Column(nullable = false)
    private Integer tokenVersion = 0;

    @Column(nullable = false, columnDefinition = "boolean not null default false")
    private boolean emailVerified = false;

    private LocalDateTime deletedAt;

    @Builder
    private User(String email, String username, String nickname, String password,
                 String bio, String profileImage, AuthProvider authProvider) {
        this.email = email;
        this.username = username;
        this.nickname = nickname;
        this.password = password;
        this.bio = bio;
        this.profileImage = profileImage;
        this.authProvider = authProvider;
        this.tokenVersion = 0;
    }

    public static User create(String email, String username, String nickname, String encodedPassword) {
        return User.builder()
                .email(email)
                .username(username)
                .nickname(nickname)
                .password(encodedPassword)
                .build();
    }

    public static User createOAuth(String email, String username, String nickname, AuthProvider authProvider) {
        User user = User.builder()
                .email(email)
                .username(username)
                .nickname(nickname)
                .authProvider(authProvider)
                .build();
        user.emailVerified = true;
        return user;
    }

    public void update(String nickname, String bio) {
        if (nickname != null) this.nickname = nickname;
        if (bio != null) this.bio = bio;
    }

    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
        this.tokenVersion++;
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.tokenVersion++;
    }

    public void restore() {
        this.deletedAt = null;
    }

    public void verifyEmail() {
        this.emailVerified = true;
    }

    public void updateProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}
