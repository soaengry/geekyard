package com.soaengry.geekyard.domain.user.repository;

import com.soaengry.geekyard.domain.user.entity.EmailVerificationToken;
import com.soaengry.geekyard.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, String> {

    Optional<EmailVerificationToken> findByToken(String token);

    void deleteAllByUser(User user);
}
