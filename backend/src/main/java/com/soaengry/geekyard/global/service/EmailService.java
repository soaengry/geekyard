package com.soaengry.geekyard.global.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = frontendUrl + "/email-verify?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject("[Geekyard] 이메일 인증을 완료해주세요");
            helper.setText(buildHtml(verifyUrl), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("이메일 전송에 실패했습니다.", e);
        }
    }

    private String buildHtml(String verifyUrl) {
        return """
                <!DOCTYPE html>
                <html lang="ko">
                <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="560" cellpadding="0" cellspacing="0"
                               style="background:#ffffff;border-radius:16px;padding:48px 40px;
                                      box-shadow:0 2px 12px rgba(0,0,0,0.08);">
                          <tr>
                            <td>
                              <h2 style="margin:0 0 8px;color:#2C2C2C;font-size:22px;font-weight:700;">
                                이메일 인증
                              </h2>
                              <p style="margin:0 0 32px;color:#6E6E6E;font-size:15px;line-height:1.6;">
                                Geekyard 서비스 이용을 위해<br>이메일 인증을 완료해주세요.
                              </p>
                              <a href="%s"
                                 style="display:inline-block;background-color:#A252C2;color:#ffffff;
                                        padding:14px 32px;border-radius:10px;text-decoration:none;
                                        font-size:15px;font-weight:600;letter-spacing:-0.2px;">
                                이메일 인증
                              </a>
                              <p style="margin:32px 0 0;color:#9E9E9E;font-size:13px;line-height:1.6;">
                                이 링크는 <strong>30분</strong>간 유효합니다.<br>
                                본인이 요청하지 않은 경우 이 메일을 무시해주세요.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(verifyUrl);
    }
}
