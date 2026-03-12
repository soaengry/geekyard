# CLAUDE.md

## Geekyard Backend

Anime community platform — Spring Boot backend.

## Commands

Run from `backend/` directory:

```bash
./gradlew build
./gradlew bootRun
./gradlew test
./gradlew clean build
./gradlew test --tests "com.soaengry.geekyard.domain.user.*"   # single package/class
```

## Tech Stack

| Category      | Technology                  | Version         |
| ------------- | --------------------------- | --------------- |
| Language      | Java                        | 17              |
| Framework     | Spring Boot                 | 3.5.12-SNAPSHOT |
| Build         | Gradle                      | -               |
| Primary DB    | PostgreSQL                  | 18.3            |
| Cache/Session | Redis                       | -               |
| File Storage  | AWS S3                      | -               |
| Auth          | JWT (HS256) + OAuth2        | jjwt 0.12.6     |
| Testing       | JUnit 5 + AssertJ + MockMvc | -               |

## Package Structure (DDD)

```
com.soaengry.geekyard/
├── domain/
│   ├── user/
│   ├── email/
│   ├── anime/
│   ├── search/
│   ├── chat/        # WebSocket + MongoDB
│   └── feed/
└── global/
    ├── common/      # ApiResponse, SuccessCode
    ├── config/
    ├── exception/   # GlobalExceptionHandler
    ├── security/
    │   ├── jwt/
    │   └── oauth2/
    ├── service/
    └── util/
```

Each domain follows: `controller → service → repository → entity + dto + exception`

## Conventions

- **DTO**: Java Records; split into `request/` and `response/` subpackages
- **Entity**: `@Getter` + `@Builder` + `@NoArgsConstructor(access = PROTECTED)`; use `create()` static factory and `update()` instance methods; extend `BaseTimeEntity` for audit fields
- **DI**: Constructor injection via `@RequiredArgsConstructor`
- **Transactions**: Class-level `@Transactional`; `readOnly = true` for queries
- **Soft Delete**: `deletedAt` on User (30-day recovery window)
- **Optimistic Locking**: `@Version` on User entity

## API Response

All controllers return `ResponseEntity<ApiResponse<?>>`.

```java
// Success
return ResponseEntity.ok(ApiResponse.ok(SuccessCode.CREATED, responseDto));

// Error — throw domain exception, GlobalExceptionHandler maps to HTTP status
throw new UserException(UserErrorCode.USER_NOT_FOUND);
```

`ApiResponse<T>` structure: `ApiStatus status` (code + message) + `T data` (`@JsonInclude(NON_NULL)`).

## Exception System

Each domain has `{Module}ErrorCode` enum + `{Module}Exception` pair. HTTP status is auto-derived from the error code name in `GlobalExceptionHandler.determineHttpStatusFromCode()`:

| Code name pattern                              | HTTP Status |
| ---------------------------------------------- | ----------- |
| `AUTH*`, `UNAUTHORIZED_ACCESS`                 | 401         |
| `INVALID_PASSWORD`, `*UNAUTHORIZED` (non-AUTH) | 403         |
| `DUPLICATE*`                                   | 409         |
| `*NOT_FOUND`                                   | 404         |
| `VALIDATION*`, `*LIMIT_EXCEEDED`, others       | 400         |

When adding a new domain exception, register a handler in `GlobalExceptionHandler`:

```java
@ExceptionHandler({Module}Exception.class)
public ResponseEntity<ApiResponse<?>> handle{Module}Exception({Module}Exception e) {
    log.warn("{Module} Exception: {} - {}", e.getErrorCode().name(), e.getMessage());
    HttpStatus status = determineHttpStatusFromCode(e.getErrorCode().name());
    ErrorCode errorCode = ErrorCode.from(e.getErrorCode().name(), e.getMessage(), status);
    return ResponseEntity.status(status).body(ApiResponse.error(errorCode));
}
```

## Security

- JWT: Access Token (1 day) + Refresh Token (7 days), HS256
- Passwords: BCrypt strength 12
- Redis: RefreshToken stored as SHA-256 hash, 7-day TTL
- Device limit: max 5; oldest removed on overflow
- Token versioning: all tokens invalidated on password change or account deletion
- OAuth2: Kakao, Naver, Google via `CustomOAuth2UserService`
- CORS: default `localhost:3000`
- S3: profile images (jpeg/jpg/png/webp, 10 MB max)

## Testing

- `@SpringBootTest` + `@ActiveProfiles("test")` + `@Transactional`
- Given-When-Then pattern with Korean `@DisplayName`
- Both success and failure (exception) cases required per feature
