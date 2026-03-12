## Security

- **JWT**: Access Token(1일) + Refresh Token(7일), HS256
- **JwtAuthenticationFilter**: Bearer 토큰 검증, SecurityContext 설정
- **JwtAuthenticationEntryPoint**: 미인증 시 401 JSON 응답
- **비밀번호**: BCrypt (strength 12)
- **Redis**: RefreshToken SHA-256 해시 저장, 7일 TTL
- **디바이스 제한**: 최대 5대, 초과 시 가장 오래된 토큰 삭제
- **Token Version**: 비밀번호 변경/탈퇴 시 전체 토큰 무효화
- **OAuth2**: Kakao, Naver, Google (CustomOAuth2UserService)
- **CORS**: CorsConfig (기본 localhost:3000)
- **S3**: 프로필 이미지 업로드 (jpeg/jpg/png/webp, 10MB 제한)
