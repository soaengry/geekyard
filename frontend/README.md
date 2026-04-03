# Geekyard Frontend

<div align="center">

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-433E38?logo=zustand)](https://zustand-demo.pmnd.rs/)
[![Zod](https://img.shields.io/badge/Zod-4-3068B7?logo=zod)](https://zod.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

</div>

---

## 목차

- [기술 스택](#기술-스택)
- [시작하기](#시작하기)
- [환경변수](#환경변수)
- [프로젝트 구조](#프로젝트-구조)
- [아키텍처 패턴](#아키텍처-패턴)
- [기여 가이드](#기여-가이드)

---

## 기술 스택

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| UI | React | 19 |
| Language | TypeScript | 5.7 |
| Build | Vite | 6 |
| Styling | Tailwind CSS | 3.4 |
| State | Zustand | 5 |
| Form | React Hook Form | 7 |
| Validation | Zod | 4 |
| HTTP | Axios | 1.13 |
| Routing | React Router | 7 |
| Realtime | @stomp/stompjs | 7 |
| Charts | Recharts | 3 |
| Toast | React Toastify | 11 |
| Linter | ESLint | 9 |

---

## 시작하기

### 사전 요구사항

- Node.js 20+
- npm 10+
- 백엔드 API 서버 실행 중 (`http://localhost:8080`)

### 설치 및 실행

```bash
cd frontend

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env   # 없을 경우 아래 내용으로 직접 생성

# 개발 서버 실행
npm run dev
# → http://localhost:3000
```

### 주요 명령어

```bash
npm run dev       # 개발 서버 (포트 3000, /api → :8080 프록시)
npm run build     # 프로덕션 빌드 (TypeScript 컴파일 + Vite 번들링)
npm run lint      # ESLint 검사 (커밋 전 필수)
npm run preview   # 빌드 결과물 로컬 미리보기
```

---

## 환경변수

`frontend/.env` 파일을 생성하세요:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OAUTH2_BASE_URL=/oauth2/authorization
```

> **주의**: 환경변수는 반드시 `VITE_` 접두사를 붙여야 하며, `global/config/env.ts`의 `ENV` 객체를 통해서만 접근하세요.

```typescript
// src/global/config/env.ts
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  OAUTH2_BASE_URL: import.meta.env.VITE_OAUTH2_BASE_URL,
} as const
```

---

## 프로젝트 구조

```
frontend/src/
├── main.tsx                        # 앱 진입점
├── index.css                       # 전역 스타일 (Tailwind + CSS 변수)
│
├── app/
│   ├── App.tsx                     # 루트 컴포넌트
│   └── routes/
│       ├── AppRouter.tsx           # 라우트 정의 (모든 페이지 lazy import)
│       └── ProtectedRoute.tsx      # 인증 필요 라우트 가드
│
├── domain/                         # 도메인별 DDD 구조
│   ├── auth/
│   │   ├── api/                    # API 호출 함수
│   │   ├── store/                  # useAuthStore (Zustand)
│   │   ├── components/             # 도메인 전용 컴포넌트
│   │   ├── pages/                  # 페이지 컴포넌트
│   │   ├── auth.constants.ts       # API 경로 상수
│   │   ├── auth.utils.ts           # 토큰 스토리지 유틸
│   │   ├── types.ts                # 타입 정의
│   │   └── index.ts                # barrel export
│   │
│   ├── anime/                      # 애니메 탐색, 리뷰
│   ├── animelist/                  # 애니메 컬렉션
│   ├── feed/                       # 피드, 댓글
│   ├── chat/                       # 실시간 채팅
│   └── user/                       # 프로필, 통계
│
└── global/                         # 공통 모듈
    ├── api/
    │   └── axiosInstance.ts        # Axios 인스턴스 (인터셉터 포함)
    ├── components/
    │   ├── Header.tsx
    │   └── Layout.tsx
    ├── config/
    │   └── env.ts                  # 환경변수 객체
    ├── hooks/
    │   └── useSentinelObserver.ts  # 무한 스크롤 훅
    ├── pages/
    │   └── HomePage.tsx
    └── utils/
        ├── extractApiError.ts      # Axios 에러 메시지 추출
        └── formatDate.ts           # 날짜 포맷
```

---

## 아키텍처 패턴

### 토큰 관리 및 Axios 인터셉터

```
요청 → Request Interceptor → Authorization: Bearer <accessToken> → API 서버
응답 ← 정상: 그대로 반환
응답 ← 401: Refresh Token으로 갱신 시도
         → 성공: 새 AccessToken으로 큐에 쌓인 요청 재시도
         → 실패: 토큰 초기화 + /login 리다이렉트
```

토큰은 `localStorage`에 저장됩니다:

| 키 | 설명 |
|----|------|
| `geekyard_access_token` | JWT 액세스 토큰 |
| `geekyard_refresh_token` | JWT 리프레시 토큰 |
| `geekyard_device_id` | 디바이스 식별자 (UUID) |

### 무한 스크롤

직접 `IntersectionObserver`를 작성하지 말고 `useSentinelObserver` 훅을 사용하세요:

```tsx
const sentinelRef = useRef<HTMLDivElement>(null)
const handleLoadMore = useCallback(() => setPage((p) => p + 1), [])

useSentinelObserver({
  sentinelRef,
  hasMore,
  loading: loadingMore || initialLoading,
  onLoadMore: handleLoadMore,
})

// JSX
<div ref={sentinelRef} className="h-4" />
```

### 필터 변경 시 Race Condition 방지

```tsx
useEffect(() => {
  const controller = new AbortController()

  fetchData(filterParams, controller.signal)
    .catch((err) => {
      if (err?.name === 'CanceledError') return  // 정상 취소
      setError(true)
    })

  return () => controller.abort()  // 클린업: 이전 요청 취소
}, [filterKey])
```

### 라우트 코드 스플리팅

`AppRouter.tsx`에서 모든 페이지는 `React.lazy`로 임포트됩니다:

```tsx
const AnimePage = lazy(() => import('../../domain/anime/pages/AnimeListPage'))

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/anime" element={<AnimePage />} />
  </Routes>
</Suspense>
```

### 상태 관리 (Zustand)

전역 상태는 인증 정보만 Zustand로 관리합니다. 나머지 서버 상태는 컴포넌트 로컬 `useState`로 관리합니다.

```typescript
// useAuthStore
const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
const user = useAuthStore((s) => s.user)
```

---

## 기여 가이드

### 코딩 규칙

새 코드를 작성하기 전에 `.claude/rules/frontend-coding-rules.md`를 확인하세요. 주요 규칙:

**필수**
- 폼은 반드시 `React Hook Form` + `Zod` 사용 — `useState`로 폼 관리 금지
- 스타일은 Tailwind 유틸리티 클래스만 — 인라인 `style` 속성 금지
- 미사용 `import`, `const` 금지
- 작업 완료 전 `npm run lint` 실행, 0 errors

**성능**
- 리스트 아이템 컴포넌트는 `React.memo` 필수
- 자식에게 전달하는 핸들러는 `useCallback` 필수
- `useCallback`은 컴포넌트 최상위에서 선언 (JSX 인라인 금지)
- `<img>` 태그에 `loading="lazy"` 필수

**비동기**
- blob URL (`URL.createObjectURL`) 생성 시 unmount에서 `revokeObjectURL` 해제
- 필터 변경 시 `AbortController`로 이전 요청 취소
- `CanceledError`는 에러로 처리하지 않음

### 새 도메인 모듈 추가

```
src/domain/{module}/
├── api/          {module}.api.ts
├── store/        use{Module}Store.ts  (필요 시)
├── components/
├── pages/
├── {module}.constants.ts
├── types.ts
└── index.ts
```

1. `types.ts`에 인터페이스 정의
2. `{module}.constants.ts`에 API 경로 상수 정의
3. `api/{module}.api.ts`에 API 함수 구현
4. `AppRouter.tsx`에 `lazy` 라우트 등록

### 테마

```css
/* CSS 변수 (index.css) */
--primary: #A252C2      /* 보라색 */
--secondary: #F5A623    /* 주황색 */
--accent: #4A90E2       /* 파란색 */
--background, --surface, --content, --subtle, --error
```

다크 모드는 `@media (prefers-color-scheme: dark)`로 자동 적용됩니다.
