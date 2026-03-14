# Feed/Like/Bookmark/Search 버그 수정 & 기능 보완

## 수정 사항 5건

### 1. 애니 상세 피드 탭에서 게시글 작성 가능
- `FeedForm`에 `preSelectedAnimeId` + `preSelectedAnimeName` props 추가
- 전달되면 애니 검색 UI 숨기고 선택된 애니 표시
- `AnimeDetailModal` 피드 탭, `AnimeDetailPage` 피드 섹션에 FeedForm 추가

### 2. 리뷰 좋아요 토글 시 likeCount 이중 감소 버그
- **원인**: `ReviewInteractionService.toggleLike()`이 `AnimeReview` 엔티티의 likeCount를 변경하지 않고 `getLikeCount() ± 1`로 응답만 반환 → DB 값은 변경 안 됨, 프론트가 다음 조회 시 이전 값 보게 됨
- **수정**: `AnimeReview`에 `incrementLikeCount()`, `decrementLikeCount()` 추가 → 서비스에서 호출

### 3. 마이페이지 피드 좋아요 색상 미반영
- **원인**: `UserActivityService.getMyFeeds()`가 `liked=false, bookmarked=false` 하드코딩
- **수정**: `getMyFeeds`에서도 실제 liked/bookmarked 상태 조회하여 반영
- 모든 6개 탭의 피드/리뷰에 대해 정확한 상태 반영

### 4. 피드 이미지 최대 4장 + 원본 보기 + 캐러셀
- **Backend**: `Feed.imageUrl` (단일) → `Feed.imageUrls` (JSON 배열, 최대 4장)
- `FeedResponse.imageUrl` → `imageUrls: List<String>`
- `FeedController`: `@RequestPart("files")` 복수 파일 수신
- **Frontend**: `FeedForm` 복수 이미지 선택/미리보기, `FeedCard` 그리드 + 클릭 시 원본 모달 + 캐러셀

### 5. 애니 검색 띄어쓰기 무시
- **Backend**: `AnimeRepository` 검색 쿼리에서 `REPLACE(a.name, ' ', '')` ILIKE `REPLACE(:q, ' ', '')` 패턴 적용
- 애니 목록 검색, 피드 작성 시 애니 검색 모두에 적용됨 (같은 repository 사용)

## 파일 변경 목록

### Backend 수정
| 파일 | 변경 |
|---|---|
| `AnimeReview.java` | `incrementLikeCount()`, `decrementLikeCount()` 추가 |
| `ReviewInteractionService.java` | 토글 시 엔티티 count 변경 |
| `Feed.java` | `imageUrl` → `imageUrls` (JSON 배열) |
| `FeedResponse.java` | `imageUrl` → `imageUrls: List<String>` |
| `FeedService.java` | 복수 이미지 업로드/삭제 |
| `FeedController.java` | `@RequestPart("files")` 복수 파일 |
| `UserActivityService.java` | liked/bookmarked 상태 조회 포함 |
| `AnimeRepository.java` | 공백 제거 검색 쿼리 |

### Frontend 수정
| 파일 | 변경 |
|---|---|
| `FeedForm.tsx` | `preSelectedAnimeId` prop, 복수 이미지 |
| `FeedList.tsx` | `showForm` prop 전달 |
| `FeedCard.tsx` | 복수 이미지 그리드 + 원본 모달 + 캐러셀 |
| `AnimeDetailModal.tsx` | 피드 탭에 FeedForm 추가 |
| `AnimeDetailPage.tsx` | 피드 섹션에 FeedForm 추가 |
| `feed/types.ts` | `imageUrl` → `imageUrls: string[]` |
| `feed/api/feedApi.ts` | 복수 파일 전송 |
