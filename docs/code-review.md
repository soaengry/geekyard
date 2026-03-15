# GeekYard 코드 리뷰

> 작성일: 2026-03-14
> 대상: Feed, Review Interaction, MyPage Activity, Anime Search, Global Infra, Frontend

---

## 도메인-기능별 코드 평가

### 점수 기준: 1(심각) ~ 5(우수)

---

### 1. Feed 도메인 (Backend)

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **2** | JOIN FETCH + Page 인메모리 페이징, likeCount 동시성 경쟁, 삭제 시 FK 제약 위반 |
| 보안 | **2** | page size 상한 없음(DoS), 이미지 Content-Type 검증 미흡 |
| 성능 | **1** | 모든 목록 쿼리가 인메모리 페이징, 인덱스 누락, 단건 조회 N+1 |
| 유지보수 | **3** | FeedService가 4가지 책임 혼재, 에러 추출 패턴 중복 |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| CRITICAL | `JOIN FETCH` + `Page` → 전체 로딩 후 메모리 페이징 | 2단계 쿼리: ①ID 페이징 ②`WHERE id IN :ids` JOIN FETCH |
| HIGH | `likeCount`/`commentCount` 동시성 경쟁 | `@Query("UPDATE Feed f SET f.likeCount = f.likeCount + 1 WHERE f.id = :id")` DB 원자 연산 |
| HIGH | `deleteFeed` → FeedLike/Comment/Bookmark FK 위반 | `Feed` 엔티티에 `@OneToMany(cascade = ALL, orphanRemoval = true)` 추가 또는 서비스에서 관련 엔티티 선삭제 |
| HIGH | `size` 파라미터 상한 없음 | `@Max(100)` 또는 서비스에서 `Math.min(size, 100)` |
| MEDIUM | `toggleLike` 동시 삽입 → 500 에러 | `DataIntegrityViolationException` catch 후 재조회, 또는 `INSERT ON CONFLICT` 활용 |
| MEDIUM | S3 이미지 업로드 시 파일 타입/크기 검증 없음 | `FeedService.uploadImages`에서 Content-Type + magic bytes + 10MB 제한 검증 |

#### 상세 분석

**버그**

- **B1. JOIN FETCH + Page 인메모리 페이징 (CRITICAL)**
  - `FeedRepository.java:13-17` — `JOIN FETCH` + `Page<>` 반환 시 Hibernate가 전체 결과를 로딩한 후 메모리에서 페이징. 데이터 증가 시 OOM 위험.
  - 동일 문제: `FeedLikeRepository:24`, `FeedBookmarkRepository:24`, `FeedCommentRepository:13,16`

- **B2. likeCount/commentCount 동시성 경쟁 (HIGH)**
  - `Feed.java:73-87` — `this.likeCount++` 방식의 인메모리 증감은 동시 요청 시 lost update 발생. `@Version` 없음.
  ```java
  public void incrementLikeCount() {
      this.likeCount++; // 동시 요청 시 lost update
  }
  ```

- **B3. toggleLike 동시 삽입 시 500 에러 (HIGH)**
  - `FeedService.java:115-128` — `findByFeedAndUser` → `save` 사이에 다른 요청이 삽입하면 `UniqueConstraint` 위반으로 `DataIntegrityViolationException` → 500 에러.

- **B4. Feed 삭제 시 FK 제약 위반 (HIGH)**
  - `FeedService.java:111` — `feedRepository.delete(feed)` 호출 시 FeedLike/FeedBookmark/FeedComment에 FK가 존재하면 삭제 실패. cascade 설정 없음.

- **B5. 단건 조회 N+1 (MEDIUM)**
  - `FeedService.java:66` — `findById`는 JOIN FETCH 없이 단순 조회. `FeedResponse.from()`에서 `feed.getUser()`, `feed.getAnime()` 접근 시 추가 쿼리 2건 발생.

- **B6. S3 이미지 업로드 실패 시 이전 이미지 유실 (MEDIUM)**
  - `FeedService.java:90-96` — 수정 시 기존 이미지 S3 삭제 후 새 이미지 업로드. 업로드 실패 시 DB는 롤백되지만 S3 삭제는 되돌릴 수 없음.

- **B7. UpdateFeedRequest 빈 문자열 허용 (LOW)**
  - `UpdateFeedRequest.java` — `@NotBlank` 없이 `@Size(max=5000)`만 존재. 빈 문자열 `""` 으로 content 수정 가능.

**보안**

- **S1. page size 상한 없음 (HIGH)**
  - `FeedController.java:35-36` — `?size=999999` 요청 시 대규모 결과 로딩. 인메모리 페이징 버그와 결합 시 DoS 벡터.
  ```java
  @RequestParam(defaultValue = "10") int size // 상한 없음
  ```

- **S2. 이미지 업로드 파일 타입 미검증 (MEDIUM)**
  - `FeedService.java:144-154` — `uploadImages`에서 파일 타입/크기 검증 없이 S3에 직접 업로드. 프로필 이미지는 제한이 있으나 피드 이미지는 미적용.

- **S3. IOException 클라이언트 노출 (LOW)**
  - `FeedController.java:61,74` — `throws IOException` 선언. S3 실패 시 내부 경로/버킷 정보 노출 가능.

---

### 2. Anime 도메인 - 리뷰 상호작용 (Backend)

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **2** | likeCount 동시성 경쟁 (Feed와 동일 패턴), Object[] 파싱 위험 |
| 보안 | **3** | `@AuthenticationPrincipal` null 가드 없음, rate limit 없음 |
| 성능 | **2** | JOIN FETCH + Page 인메모리 페이징, ReviewResponse에서 anime lazy load |
| 유지보수 | **2** | `findReviewOrThrow` 2곳 중복, feed 도메인 DTO 크로스 의존 |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| CRITICAL | `JOIN FETCH` + `Page` 인메모리 페이징 | Feed와 동일하게 2단계 쿼리 |
| HIGH | `likeCount` 동시성 | DB 원자 업데이트 쿼리 |
| MEDIUM | `ReviewResponse.from()`에서 `review.getAnime()` lazy load | `findByAnimeIdWithUser` 쿼리에 `JOIN FETCH r.anime` 추가 |
| MEDIUM | `LikeResponse`/`BookmarkResponse`를 feed 도메인에서 import | `global/common/dto/`로 이동하거나 anime 도메인에 별도 생성 |
| MEDIUM | `findReviewOrThrow` 중복 | 공통 메서드 추출 (Repository default method 또는 공유 헬퍼) |
| LOW | `Object[]` 통계 쿼리 | typed projection interface (`ReviewStatsProjection`) 사용 |

#### 상세 분석

**버그**

- **B1. likeCount 동시성 경쟁 (CRITICAL)**
  - `AnimeReview.java:77-83`, `ReviewInteractionService.java:28-41` — Feed와 동일한 인메모리 증감 패턴. `@Version` 없음.

- **B2. Object[] 통계 파싱 위험 (MEDIUM)**
  - `AnimeReviewService.java:53-59` — `List<Object[]>` 반환 후 인덱스 기반 캐스팅. null 체크 없이 `.doubleValue()` 호출.

- **B3. getMyReview → null 반환 (LOW)**
  - `AnimeReviewService.java:64` — `orElse(null)` 후 200 OK로 감싸서 반환. "리뷰 없음"과 "직렬화 에러" 구분 불가.

- **B4. findReviewOrThrow에서 anime lazy load (LOW)**
  - `AnimeReviewService.java:121`, `ReviewInteractionService.java:60` — `review.getAnime().getId()` 호출 시 불필요한 lazy load 발생.

**보안**

- **S1. @AuthenticationPrincipal null 가드 없음 (HIGH)**
  - `ReviewInteractionController.java:25,37` — SecurityConfig 미스 설정 시 `user`가 null이 되어 NPE 발생.

- **S2. rate limit 없음 (LOW)**
  - 좋아요/북마크 토글 엔드포인트에 rate limit 미적용. 스팸 요청으로 DB 부하 유발 가능.

**성능**

- **P1. JOIN FETCH + Page 인메모리 페이징 (CRITICAL)**
  - `AnimeReviewRepository.java:16-17`, `ReviewLikeRepository.java:24-25`, `ReviewBookmarkRepository.java:24-25`

- **P2. ReviewResponse에서 anime lazy load (MEDIUM)**
  - `ReviewResponse.java:37-38` — `review.getAnime().getName()` 호출. `findByAnimeIdWithUser` 쿼리가 anime을 fetch하지 않음.

- **P3. (user_id, review_id) 인덱스 누락 (MEDIUM)**
  - unique constraint 인덱스는 `(review_id, user_id)` 순서. `user_id` 기준 조회에 비효율적.

- **P4. ILIKE + REPLACE 인덱스 불가 (LOW)**
  - `AnimeRepository.java:18-41` — full table scan 불가피.

**유지보수**

- **M1. findReviewOrThrow 중복 (HIGH)**
  - `AnimeReviewService.java:118-125`, `ReviewInteractionService.java:57-64` — 동일 로직 복붙.

- **M2. feed 도메인 DTO 크로스 의존 (MEDIUM)**
  - `ReviewInteractionService.java:11-12` — `import feed.dto.response.LikeResponse/BookmarkResponse`.

- **M3. Object[] 반환 타입 (MEDIUM)**
  - 타입 안전성 없는 `Object[]` 대신 projection interface 사용 권장.

---

### 3. User 도메인 - 마이페이지 (Backend)

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **3** | `review.getUser()` NPE 가능성, 전반적으로 안정적 |
| 보안 | **2** | page size 상한 없음, 음수 page → 500 에러 |
| 성능 | **3** | batch 좋아요/북마크 조회는 잘 설계됨, 일부 lazy load 위험 |
| 유지보수 | **2** | 6개 컨트롤러 엔드포인트 반복 패턴, `mapFeedsWithStatus`/`mapReviewsWithStatus` 중복 |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| HIGH | `size` 상한 + `page` 음수 검증 없음 | `@Min(0) int page, @Min(1) @Max(100) int size` |
| MEDIUM | 6개 엔드포인트 중복 | Spring의 `Pageable` 파라미터 직접 활용 |
| MEDIUM | `mapFeedsWithStatus`/`mapReviewsWithStatus` 중복 | 제네릭 헬퍼 메서드로 통합 |
| LOW | `Set.copyOf` → 중복 시 예외 | `new HashSet<>(...)` 사용 |

#### 상세 분석

**버그**

- **B1. review.getUser() NPE (LOW)**
  - `UserActivityService.java:89` — `review.isSiteUser()` true 시 `review.getUser()` 호출. user 연관이 로드되지 않았거나 삭제된 경우 NPE.

**보안**

- **S1. page/size 검증 없음 (HIGH)**
  - `UserController.java:75-76` — 음수 page → `IllegalArgumentException` → 500. size 상한 없음 → DoS.

- **S2. IOException 미핸들링 (MEDIUM)**
  - `UserController.java:51` — `updateProfileImage`의 `IOException`이 `GlobalExceptionHandler`에 핸들러 없음.

**성능**

- batch 좋아요/북마크 ID 조회 패턴은 잘 설계되어 N+1 회피.

**유지보수**

- **M1. 6개 동일 엔드포인트 (MEDIUM)**
  - `UserController.java:72-124` — page/size 추출 → 서비스 호출 → ApiResponse 감싸기 반복.

---

### 4. Anime 도메인 - 검색 (Backend)

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **4** | 로직 정확, 특이사항 없음 |
| 보안 | **4** | 파라미터 바인딩으로 SQL injection 방지됨 |
| 성능 | **2** | `REPLACE + ILIKE '%...%'` → 인덱스 사용 불가, full scan |
| 유지보수 | **3** | 네이티브 쿼리 + countQuery 중복 |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| MEDIUM | `REPLACE(name,' ','') ILIKE '%..%'` full scan | `pg_trgm` 확장 + GIN 인덱스, 또는 정규화된 검색 컬럼 추가 |
| LOW | 네이티브 쿼리 + countQuery 유지보수 부담 | 데이터 규모가 커지면 Elasticsearch 도입 검토 |

---

### 5. Global 인프라 (Backend)

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **2** | `UNAUTHORIZED_ACCESS` → 400 매핑 오류, SuccessCode 201 미반영 |
| 보안 | **2** | WebSocket `/ws/**` 인증 없음, S3 Content-Type 클라이언트 신뢰 |
| 성능 | **4** | 글로벌 인프라는 대체로 양호 |
| 유지보수 | **2** | 3개 동일 예외 핸들러 중복, S3Service가 UserException throw |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| HIGH | `determineHttpStatusFromCode`에서 `UNAUTHORIZED_ACCESS` → 400으로 잘못 매핑 | 명시적 case 추가, 또는 ErrorCode enum에 HttpStatus 직접 포함 |
| HIGH | `SuccessCode(201, ...)` 지만 컨트롤러가 `ResponseEntity.ok()` → 항상 200 | `ResponseEntity.status(successCode.getCode())` 사용 |
| HIGH | S3Service가 `UserException` throw | `S3Exception` 또는 `GlobalException` 으로 분리 |
| MEDIUM | WebSocket 인증 미적용 | `ChannelInterceptor`에서 JWT 검증 추가 |
| MEDIUM | 3개 동일 예외 핸들러 | 공통 base exception + 단일 핸들러 |

#### 상세 분석

**버그**

- **B1. UNAUTHORIZED_ACCESS HTTP 매핑 오류 (HIGH)**
  - `GlobalExceptionHandler.java:63-76` — `UNAUTHORIZED_ACCESS`는 `startsWith("AUTH")`에 매칭 안 되고 `endsWith("UNAUTHORIZED")`에도 안 됨 → 400으로 잘못 매핑. 문서에는 401이어야 함.

- **B2. SuccessCode 201이 실제 200 반환 (MEDIUM)**
  - `SuccessCode.java` — `CREATED(201, ...)`, `REVIEW_CREATED(201, ...)` 등이 있지만 컨트롤러에서 `ResponseEntity.ok()` (=200) 사용.

**보안**

- **S1. WebSocket 인증 없음 (HIGH)**
  - `SecurityConfig.java:59` — `/ws/**`가 `permitAll()`. WebSocket 핸들러에서 별도 인증 없으면 미인증 사용자 접속 가능.

- **S2. S3 Content-Type 클라이언트 신뢰 (HIGH)**
  - `S3Service.java:45` — `file.getContentType()`는 클라이언트가 보낸 값. 스푸핑 가능. Apache Tika 등으로 magic bytes 검증 필요.

- **S3. CSRF 비활성화 (LOW)**
  - `SecurityConfig.java:52` — JWT 기반이므로 일반적으로 안전하나 OAuth2 쿠키 플로우와 결합 시 주의 필요.

**유지보수**

- **M1. 3개 동일 예외 핸들러 (MEDIUM)**
  - `GlobalExceptionHandler.java:22-44` — `handleAnimeException`, `handleFeedException`, `handleUserException`가 복붙 동일.

- **M2. S3Service → UserException (MEDIUM)**
  - `S3Service.java:3-4` — 글로벌 서비스가 도메인 특정 예외 throw. feed에서 호출 시 의미 부적절.

- **M3. 문자열 기반 HTTP 상태 매핑 취약 (LOW)**
  - 에러코드 이름 변경 시 HTTP 상태도 암묵적으로 변경됨. ErrorCode enum에 HttpStatus 직접 포함이 더 안전.

---

### 6. Frontend 전체

| 항목 | 점수 | 근거 |
|------|------|------|
| 버그 | **2** | props→state 동기화 누락, 삭제 확인 비동기 미대기, overflow 충돌 |
| 보안 | **4** | React의 기본 XSS 방어 적용됨, 이미지 URL도 안전 |
| 성능 | **3** | 목록 무한 성장, formatDate 재생성, memo 미적용 |
| 유지보수 | **2** | formatDate 4곳 중복, 에러 추출 6곳 중복, MyPage 거대 switch문, feedApi 6개 동일 함수 |

#### 핵심 개선안

| 우선순위 | 이슈 | 해결 방안 |
|----------|------|-----------|
| HIGH | FeedCard/ReviewCard/CommentCard: props→state 미동기화 | `useEffect`로 `feed.id` 변경 시 재동기화, 또는 부모에서 `key={feed.id}` |
| HIGH | Modal + Lightbox `overflow: hidden` 충돌 | 스택 기반 scroll lock 관리 (`useScrollLock` hook) |
| HIGH | 삭제 확인에서 `handleDelete()` await 없음 | `await handleDelete()` 후 `setShowConfirm(false)`, 실패 시 유지 |
| MEDIUM | `formatDate` 4곳 중복 | `global/utils/formatDate.ts` 추출 |
| MEDIUM | 에러 메시지 추출 6곳 중복 | `global/utils/extractApiError.ts` 추출 |
| MEDIUM | feedApi.ts 6개 동일 페이징 함수 | 제네릭 팩토리 함수로 통합 |
| MEDIUM | MyPage 310줄 + 거대 switch | 탭별 컴포넌트 분리, 데이터 기반 fetch 매핑 |
| MEDIUM | FeedCard의 Lightbox 327줄 내장 | `<ImageLightbox>` 컴포넌트 분리 |
| LOW | LikeButton/BookmarkButton `React.memo` 미적용 | 리스트 내 불필요한 리렌더 방지를 위해 `memo()` 래핑 |
| LOW | FeedForm에서 `FileReader` 대신 `URL.createObjectURL` 사용 | 동기적이고 메모리 효율적 |

#### 상세 분석

**버그**

- **B1. props→state 동기화 누락 (HIGH)**
  - `FeedCard.tsx:22-25`, `ReviewCard.tsx:26-28`, `CommentCard.tsx:13` — `useState(feed.liked)` 등은 마운트 시점만 반영. 부모가 새 feed 데이터를 전달해도 무시됨.
  ```tsx
  const [liked, setLiked] = useState(feed.liked)  // 마운트 시 1회만
  ```

- **B2. overflow: hidden 중첩 충돌 (HIGH)**
  - `AnimeDetailModal.tsx:22-25` + `FeedCard.tsx:98-111` — 모달 안에서 Lightbox 열면 둘 다 `overflow: hidden` 설정. Lightbox 닫힐 때 `overflow: ''`로 복원하면 모달의 scroll lock 해제됨.

- **B3. 삭제 확인 비동기 미대기 (MEDIUM)**
  - `FeedCard.tsx:226-229`, `CommentCard.tsx:107-109`, `ReviewCard.tsx:137-139` — `handleDelete()` await 없이 `setShowConfirm(false)` 호출. 삭제 실패해도 확인 UI 닫힘.

- **B4. FeedForm FileReader 언마운트 후 setState (LOW)**
  - `FeedForm.tsx:109-115` — FileReader 비동기 콜백이 컴포넌트 언마운트 후에도 실행될 수 있음.

- **B5. FeedForm imagePreviews/imageFiles 비동기 불일치 (LOW)**
  - `FeedForm.tsx:109-115` — `setImageFiles`는 동기, `setImagePreviews`는 FileReader.onload 비동기. 빠른 추가/삭제 시 불일치 가능.

- **B6. AnimeDetailModal fetch 경쟁 (LOW)**
  - `AnimeDetailModal.tsx:37-43` — id 빠르게 변경 시 AbortController 없어 마지막 응답이 아닌 응답이 반영될 수 있음.

**보안**

- React의 기본 XSS 방어가 적용되어 특별한 취약점 없음. `<img src>` 태그는 `javascript:` URI에 취약하지 않음.

**성능**

- **P1. 무한 목록 성장 (LOW)**
  - `FeedList.tsx:42`, `MyPage.tsx` — "더보기"로 계속 추가하면 DOM 노드 무한 증가. 가상화 미적용.

- **P2. formatDate 매 렌더 재생성 (LOW)**
  - 컴포넌트 내부에 정의되어 매 렌더마다 새 함수 생성. 유틸로 추출하면 해결.

- **P3. useMemo 과도 사용 (LOW)**
  - `AnimeDetailModal.tsx:46-53` — 작은 배열 `Array.find()`에 `useMemo` 적용. 오버헤드가 이점보다 클 수 있음.

**유지보수**

- **M1. formatDate 4곳 중복**
  - FeedCard, CommentCard, ReviewCard, MyPage에서 동일 함수 정의.

- **M2. 에러 메시지 추출 6곳 중복**
  - `(err.response?.data as { status?: { message?: string } })?.status?.message` 패턴이 FeedCard, FeedForm, FeedCommentSection, ReviewCard 등에서 반복.

- **M3. feedApi.ts 6개 동일 함수**
  - `getMyFeeds`, `getLikedFeeds`, `getBookmarkedFeeds`, `getMyComments`, `getLikedReviews`, `getBookmarkedReviews`가 엔드포인트만 다르고 동일 구조.

- **M4. MyPage 거대 switch문**
  - `MyPage.tsx:44-85` — 6개 탭에 대한 동일 페이징 로직이 switch case로 반복.

- **M5. FeedCard Lightbox 내장**
  - `FeedCard.tsx` 327줄. Lightbox 로직(253-322줄)을 별도 컴포넌트로 분리 필요.

---

## 종합 점수표

| 도메인 | 버그 | 보안 | 성능 | 유지보수 | **평균** |
|--------|------|------|------|----------|----------|
| Feed (BE) | 2 | 2 | **1** | 3 | **2.0** |
| Review Interaction (BE) | 2 | 3 | 2 | 2 | **2.3** |
| MyPage Activity (BE) | 3 | 2 | 3 | 2 | **2.5** |
| Anime Search (BE) | 4 | 4 | 2 | 3 | **3.3** |
| Global Infra (BE) | 2 | 2 | 4 | 2 | **2.5** |
| Frontend 전체 | 2 | 4 | 3 | 2 | **2.8** |

---

## 가장 시급한 개선 사항 Top 5

1. **JOIN FETCH + Page 인메모리 페이징** — 모든 목록 API에 해당, 데이터 증가 시 OOM 위험. 2단계 쿼리로 전환 필수.
2. **likeCount/commentCount 동시성 경쟁** — DB 원자 업데이트 쿼리(`SET count = count + 1`)로 전환.
3. **page size 상한 미적용** — 모든 페이징 엔드포인트에 `@Max(100)` 또는 서비스 레벨 clamp 추가.
4. **Feed 삭제 시 FK 제약 위반** — cascade 설정 또는 관련 엔티티 선삭제 로직 추가.
5. **GlobalExceptionHandler UNAUTHORIZED_ACCESS 매핑 오류** — 명시적 case 추가로 401 반환 보장.
