# Geekyard Backend

<div align="center">

[![Java](https://img.shields.io/badge/Java-17-ED8B00?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6.x-6DB33F?logo=spring-security&logoColor=white)](https://spring.io/projects/spring-security)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-HS256-black?logo=jsonwebtokens)](https://jwt.io/)

</div>

---

## 목차

- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [환경변수](#환경변수)
- [API 문서](#api-문서)
- [프로젝트 구조](#프로젝트-구조)
- [보안](#보안)
- [테스트](#테스트)

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| Framework | Spring Boot | 3.5 |
| Language | Java | 17 |
| ORM | Spring Data JPA + Hibernate | 6.6 |
| NoSQL | Spring Data MongoDB | - |
| Cache | Spring Data Redis | - |
| Security | Spring Security + JWT | 6.x / 0.12.6 |
| OAuth2 | Spring OAuth2 Client | - |
| Realtime | Spring WebSocket (STOMP) | - |
| Storage | AWS SDK S3 | 2.25 |
| Rate Limit | Bucket4j | 8.10.1 |
| Migration | Flyway | - |
| Mail | Spring Mail | - |
| Build | Gradle | 8.x |
| Test DB | H2 (in-memory) | - |

---

## 시작하기

### 사전 요구사항

- Java 17+
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+

### 빌드 & 실행

```bash
# 프로젝트 루트에서
cd backend

# 환경변수 파일 생성
cp ../infra/.env.example .env
# .env 파일 편집 후

# 개발 서버 실행
./gradlew bootRun

# 프로덕션 빌드
./gradlew build
java -jar build/libs/backend-*.jar --spring.profiles.active=production
```

### Docker로 실행

```bash
# 이미지 빌드
docker build -t geekyard-backend .

# 실행
docker run -d \
  --env-file .env \
  -e SPRING_PROFILES_ACTIVE=production \
  -p 8080:8080 \
  geekyard-backend
```

---

## 환경변수

`.env` 파일을 `backend/` 디렉토리에 생성하세요. `../infra/.env.example`을 참고하세요.

### 필수 환경변수

| 변수 | 설명 | 예시 |
|------|------|------|
| `POSTGRESQL_DATABASE` | DB 이름 | `geekyard` |
| `POSTGRESQL_USERNAME` | DB 사용자 | `postgres` |
| `POSTGRESQL_PASSWORD` | DB 비밀번호 | `secret` |
| `REDIS_HOST` | Redis 호스트 | `localhost` |
| `REDIS_PORT` | Redis 포트 | `6379` |
| `MONGODB_URI` | MongoDB URI | `mongodb://localhost:27017/geekyard` |
| `JWT_SECRET` | JWT 서명 키 (256bit+) | `your-secret-key` |
| `MAIL_USERNAME` | 발신 이메일 주소 | `noreply@example.com` |
| `MAIL_PASSWORD` | 이메일 앱 비밀번호 | `xxxx xxxx xxxx` |
| `AWS_S3_BUCKET` | S3 버킷명 | `geekyard-images` |
| `AWS_ACCESS_KEY` | AWS 액세스 키 | `AKIA...` |
| `AWS_SECRET_KEY` | AWS 시크릿 키 | `...` |

### OAuth2 환경변수

| 변수 | 설명 |
|------|------|
| `GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 |
| `KAKAO_CLIENT_ID` | Kakao 클라이언트 ID |
| `KAKAO_CLIENT_SECRET` | Kakao 클라이언트 시크릿 |
| `NAVER_CLIENT_ID` | Naver 클라이언트 ID |
| `NAVER_CLIENT_SECRET` | Naver 클라이언트 시크릿 |

### 선택 환경변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `MONGODB_URI` | `mongodb://localhost:27017/geekyard` | MongoDB URI |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP 호스트 |
| `MAIL_PORT` | `587` | SMTP 포트 |
| `AWS_S3_REGION` | `ap-northeast-2` | S3 리전 |
| `APP_BASE_URL` | `http://localhost:8080` | 서버 URL |
| `FRONTEND_URL` | `http://localhost:3000` | 프론트엔드 URL |

---

## API 문서

**Base URL**: `http://localhost:8080`

모든 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

에러 응답:

```json
{
  "success": false,
  "data": null,
  "message": "에러 메시지",
  "code": "ERROR_CODE"
}
```

---

### Auth `/api/auth`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `POST` | `/api/auth/signup` | ❌ | 이메일 회원가입 |
| `POST` | `/api/auth/login` | ❌ | 이메일 로그인 |
| `POST` | `/api/auth/logout` | ✅ | 로그아웃 (디바이스 토큰 제거) |
| `POST` | `/api/auth/refresh` | ❌ | 액세스 토큰 갱신 |
| `GET`  | `/api/auth/verify` | ❌ | 이메일 인증 확인 |

#### POST /api/auth/signup

```json
// Request
{
  "email": "user@example.com",
  "password": "Password1!",
  "nickname": "geekuser",
  "username": "geekuser"
}
```

#### POST /api/auth/login

```json
// Request
{
  "email": "user@example.com",
  "password": "Password1!"
}

// Response
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

#### POST /api/auth/refresh

```json
// Request Header
Authorization: Bearer <refreshToken>

// Response
{
  "accessToken": "eyJ..."
}
```

> **Rate Limit**: signup 3회/분, login 5회/분, refresh 10회/분

---

### User `/api/users`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/users/me` | ✅ | 내 프로필 |
| `PATCH` | `/api/users/me` | ✅ | 프로필 수정 |
| `PATCH` | `/api/users/me/password` | ✅ | 비밀번호 변경 |
| `DELETE` | `/api/users/me` | ✅ | 계정 탈퇴 (소프트 삭제) |
| `POST` | `/api/users/recover` | ❌ | 계정 복구 (30일 이내) |
| `GET`  | `/api/users/{username}` | ❌ | 공개 프로필 조회 |
| `GET`  | `/api/users/me/watched/calendar` | ✅ | 시청 캘린더 |
| `GET`  | `/api/users/me/watched/statistics` | ✅ | 시청 통계 |
| `GET`  | `/api/users/me/feeds` | ✅ | 내 피드 목록 |
| `GET`  | `/api/users/me/liked-feeds` | ✅ | 좋아요한 피드 |
| `GET`  | `/api/users/me/bookmarked-feeds` | ✅ | 북마크한 피드 |
| `GET`  | `/api/users/me/comments` | ✅ | 내 댓글 목록 |

---

### Anime `/api/anime`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/anime` | ❌ | 애니메 목록 (페이지네이션, 필터, 정렬) |
| `GET`  | `/api/anime/filter` | ❌ | 필터 옵션 조회 (장르, 태그, 연도) |
| `GET`  | `/api/anime/{id}` | ❌ | 애니메 상세 |
| `GET`  | `/api/anime/{id}/similar` | ❌ | 유사 작품 |
| `POST` | `/api/anime/{id}/watch` | ✅ | 시청 기록 추가/삭제 |

#### GET /api/anime 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `q` | string | 검색어 |
| `genres` | string[] | 장르 필터 (복수 가능) |
| `tags` | string[] | 태그 필터 (복수 가능) |
| `years` | string[] | 연도 필터 |
| `sort` | `popular` \| `latest` \| `score` | 정렬 (기본: popular) |
| `page` | number | 페이지 번호 (0부터) |
| `size` | number | 페이지 크기 (기본: 20) |

---

### Review `/api/anime/{animeId}/reviews`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/anime/{animeId}/reviews` | ❌ | 리뷰 목록 |
| `GET`  | `/api/anime/{animeId}/reviews/stats` | ❌ | 리뷰 통계 (평균, 개수) |
| `GET`  | `/api/anime/{animeId}/reviews/mine` | ✅ | 내 리뷰 |
| `POST` | `/api/anime/{animeId}/reviews` | ✅ | 리뷰 작성 |
| `PATCH` | `/api/anime/{animeId}/reviews/{id}` | ✅ | 리뷰 수정 |
| `DELETE` | `/api/anime/{animeId}/reviews/{id}` | ✅ | 리뷰 삭제 |
| `POST` | `/api/anime/{animeId}/reviews/{id}/like` | ✅ | 리뷰 추천 토글 |

```json
// POST /reviews - Request
{
  "score": 4.5,
  "content": "명작입니다."
}
```

---

### Feed `/api/feeds`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/feeds` | ❌ | 피드 목록 |
| `GET`  | `/api/feeds/{feedId}` | ❌ | 피드 상세 |
| `POST` | `/api/feeds` | ✅ | 피드 작성 (이미지 최대 4장) |
| `PATCH` | `/api/feeds/{feedId}` | ✅ | 피드 수정 |
| `DELETE` | `/api/feeds/{feedId}` | ✅ | 피드 삭제 |
| `POST` | `/api/feeds/{feedId}/like` | ✅ | 좋아요 토글 |
| `POST` | `/api/feeds/{feedId}/bookmark` | ✅ | 북마크 토글 |
| `GET`  | `/api/feeds/{feedId}/comments` | ❌ | 댓글 목록 |
| `POST` | `/api/feeds/{feedId}/comments` | ✅ | 댓글 작성 |
| `DELETE` | `/api/feeds/{feedId}/comments/{id}` | ✅ | 댓글 삭제 |
| `POST` | `/api/feeds/{feedId}/comments/{id}/like` | ✅ | 댓글 좋아요 토글 |

---

### AnimeList `/api/anime-lists`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/anime-lists` | ❌ | 공개 리스트 목록 |
| `GET`  | `/api/anime-lists/me` | ✅ | 내 리스트 목록 |
| `GET`  | `/api/anime-lists/{id}` | ❌ | 리스트 상세 |
| `POST` | `/api/anime-lists` | ✅ | 리스트 생성 |
| `PATCH` | `/api/anime-lists/{id}` | ✅ | 리스트 수정 |
| `DELETE` | `/api/anime-lists/{id}` | ✅ | 리스트 삭제 |
| `POST` | `/api/anime-lists/{id}/items` | ✅ | 애니메 추가 |
| `DELETE` | `/api/anime-lists/{id}/items/{animeId}` | ✅ | 애니메 제거 |
| `POST` | `/api/anime-lists/{id}/like` | ✅ | 좋아요 토글 |

---

### Recommendation `/api/recommendations`

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/recommendations` | ✅ | 개인화 추천 목록 |
| `GET`  | `/api/recommendations/genres` | ✅ | 장르 선호도 조회 |
| `GET`  | `/api/recommendations/genres/exists` | ✅ | 선호 장르 설정 여부 |
| `PUT`  | `/api/recommendations/genres` | ✅ | 선호 장르 설정 |

---

### Chat (WebSocket)

```
WebSocket endpoint: ws://localhost:8080/ws
STOMP destination: /app/anime/{animeId}/chat
Subscribe: /topic/anime/{animeId}/chat
```

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| `GET`  | `/api/chat/{animeId}/messages` | ❌ | 이전 메시지 조회 |

---

## 프로젝트 구조

```
backend/src/main/java/com/soaengry/geekyard/
├── domain/
│   ├── user/
│   │   ├── controller/       UserController, AuthController
│   │   ├── service/          UserService
│   │   ├── repository/       UserRepository
│   │   ├── entity/           User
│   │   └── dto/              request/, response/
│   ├── anime/
│   │   ├── controller/       AnimeController, AnimeReviewController
│   │   ├── service/          AnimeService, AnimeReviewService, RecommendationService
│   │   ├── repository/       AnimeRepository, AnimeReviewRepository
│   │   ├── entity/           Anime, AnimeReview
│   │   └── dto/              AnimeSortType, ...
│   ├── animelist/
│   ├── feed/
│   │   ├── controller/       FeedController, FeedCommentController
│   │   ├── service/          FeedService, FeedCommentService
│   │   └── repository/       FeedRepository, FeedCommentRepository
│   └── chat/
│
└── global/
    ├── config/               CorsConfig, RedisConfig, S3Config
    ├── security/
    │   ├── SecurityConfig.java
    │   ├── MethodSecurityConfig.java
    │   ├── RateLimitingFilter.java
    │   ├── jwt/              JwtProvider, JwtAuthenticationFilter
    │   └── oauth2/           CustomOAuth2UserService, OAuth2SuccessHandler
    ├── service/              RedisService
    ├── util/                 ToggleHelper
    ├── exception/            GlobalExceptionHandler, ErrorCode
    └── dto/                  ApiResponse, PageResponse
```

---

## 보안

### 인증 플로우

```
로그인 요청
    → Spring Security 필터 체인
    → JwtAuthenticationFilter (Bearer 토큰 검증)
    → SecurityContext 설정
    → 컨트롤러/서비스 실행
```

### JWT 토큰 전략

| 항목 | 값 |
|------|-----|
| 알고리즘 | HS256 |
| 액세스 토큰 만료 | 24시간 |
| 리프레시 토큰 만료 | 7일 |
| 저장소 | Redis Hash (SHA-256 해시) |
| 최대 동시 디바이스 | 5개 |

### API Rate Limiting

| 엔드포인트 | 제한 |
|-----------|------|
| `POST /api/auth/login` | 5회 / 분 |
| `POST /api/auth/signup` | 3회 / 분 |
| `POST /api/auth/refresh` | 10회 / 분 |

---

## 테스트

```bash
# 전체 테스트 실행
./gradlew test

# 특정 테스트 클래스 실행
./gradlew test --tests "com.soaengry.geekyard.domain.user.service.UserServiceTest"

# 테스트 결과 확인
open build/reports/tests/test/index.html
```

### 테스트 환경

- **DB**: H2 in-memory (PostgreSQL 호환 모드)
- **Redis**: Embedded Redis (또는 로컬 Redis)
- **MongoDB**: 자동 제외 (`application-test.yaml`)
- **프레임워크**: JUnit 5 + AssertJ + MockMvc

```yaml
# 테스트 프로파일 (application.yaml 내)
spring:
  datasource:
    url: jdbc:h2:mem:testdb;MODE=PostgreSQL
  flyway:
    enabled: false
```
