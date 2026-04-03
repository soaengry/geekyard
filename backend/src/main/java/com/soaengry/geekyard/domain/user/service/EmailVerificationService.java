package com.soaengry.geekyard.domain.user.service;

import com.soaengry.geekyard.domain.user.entity.EmailVerificationToken;
import com.soaengry.geekyard.domain.user.entity.User;
import com.soaengry.geekyard.domain.user.exception.UserErrorCode;
import com.soaengry.geekyard.domain.user.exception.UserException;
import com.soaengry.geekyard.domain.user.repository.EmailVerificationTokenRepository;
import com.soaengry.geekyard.global.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    public void sendVerificationEmail(User user) {
        if (user.isEmailVerified()) {
            throw new UserException(UserErrorCode.EMAIL_ALREADY_VERIFIED);
        }

        // 기존 토큰 제거 후 새로 발급
        tokenRepository.deleteAllByUser(user);

        EmailVerificationToken token = EmailVerificationToken.create(user);
        tokenRepository.save(token);

        emailService.sendVerificationEmail(user.getEmail(), token.getToken());
    }

    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new UserException(UserErrorCode.VERIFICATION_TOKEN_INVALID));

        if (token.isExpired()) {
            tokenRepository.delete(token);
            throw new UserException(UserErrorCode.VERIFICATION_TOKEN_EXPIRED);
        }

        token.getUser().verifyEmail();
        tokenRepository.delete(token);
    }
}
