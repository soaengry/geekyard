# Geekyard Frontend

Anime community platform — React 19 + TypeScript + Vite SPA frontend

## Tech Stack

| Category   | Library         | Version | Purpose                  |
| ---------- | --------------- | ------- | ------------------------ |
| UI         | React           | 19.2.0  | Components               |
| Language   | TypeScript      | 5.9.3   | Type safety              |
| Build      | Vite            | 7       | Bundler + proxy          |
| State      | Zustand         | 5.0.11  | Global state (auth)      |
| Forms      | React Hook Form | 7       | Form management          |
| Validation | Zod             | 4       | Schema validation        |
| HTTP       | Axios           | 1.13.5  | API calls + interceptors |
| Routing    | React Router    | 7       | SPA routing              |
| Styling    | Tailwind CSS    | 3.4     | Utility CSS              |
| Alerts     | React Toastify  | 11      | Toast messages           |
| Linter     | ESLint          | 9       | Code quality             |

## Commands

```bash
npm run dev       # Dev server (port 3000, /api → localhost:8080 proxy)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview build
```

## Structure

```
src/
├── main.tsx
├── index.css
├── app/
│   ├── App.tsx
│   └── routes/
│       ├── AppRouter.tsx
│       └── ProtectedRoute.tsx
├── domain/
│   ├── auth/
│   │   ├── api/
│   │   ├── store/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── auth.constants.ts
│   │   ├── auth.utils.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── user/pages/
│   │   ├── MyPage.tsx
│   │   ├── EditProfilePage.tsx
│   │   ├── ChangePasswordPage.tsx
│   │   ├── DeleteAccountPage.tsx
│   │   └── index.ts
│   ├── chat/
│   ├── anime/
│   └── feed/
└── global/
    ├── api/axiosInstance.ts
    ├── components/
    │   ├── Header.tsx
    │   └── Layout.tsx
    ├── config/env.ts
    └── pages/
        ├── HomePage.tsx
        └── index.ts
```

## Architecture

- **DDD structure**: `domain/{module}/` (api, store, components, pages, types)
- **State**: Zustand — `useAuthStore`
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios — `axiosInstance` (token attach/refresh)
- **Styling**: Tailwind CSS only
- **Routing**: React Router v7 — `AppRouter` + `ProtectedRoute`
- **Types**: `types.ts` per domain
- **Barrel export**: `index.ts` in each module

## Theme

- **Font**: Pretendard
- **Colors**:

```
:root {
  /* Light Mode */
  --primary: #A252C2;
  --secondary: #F5A623;
  --accent: #4A90E2;
  --background: #FDFDFE;
  --surface: #FFFFFF;
  --text-primary: #2C2C2C;
  --text-secondary: #6E6E6E;
  --success: #27AE60;
  --error: #E74C3C;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode */
    --background: #121212;
    --surface: #1E1E1E;
    --text-primary: #F5F5F5;
    --text-secondary: #B0B0B0;
    --success: #2ECC71;
    --error: #FF6B6B;
  }
}

```

- UI/UX reference: `https://laftel.net/`, `https://m.kinolights.com/`

## Token Management

- Request interceptor: attach access token
- Response interceptor: auto refresh on 401
- Queueing: hold requests during refresh
- Failure: clear tokens + redirect `/login`

Storage keys:

- `geekyard_access_token`
- `geekyard_refresh_token`
- `geekyard_device_id`

## Environment

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_OAUTH2_BASE_URL=/oauth2/authorization
```

### 코딩 규칙 (필수 준수)

- **사용되지 않는 변수 절대 금지** — import, const, let, 함수 파라미터 모두 해당. 선언 후 미사용 시 삭제
- **폼은 반드시 React Hook Form + Zod 사용** — 로컬 state로 폼 관리 금지
- **스타일은 Tailwind 유틸리티 클래스만** — 인라인 `style` 속성 금지
- **환경변수는 `VITE_` 접두사** — `global/config/env.ts`에서 `ENV` 객체로 관리
- **타입은 `interface`로 도메인별 `types.ts`에 정의** — 컴포넌트 파일 내 타입 선언 최소화
- **API 경로 상수는 `{module}.constants.ts` 패턴** (예: `auth.constants.ts`) 따름
- **코드 작성 후 `npm run lint` 실행** — lint 오류 없이 완료해야 작업 완료로 간주
