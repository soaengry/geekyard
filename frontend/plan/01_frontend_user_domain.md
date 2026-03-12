# Frontend User Domain 구현 계획

**날짜**: 2026-03-12
**상태**: 완료

---

## Context
백엔드에 구현된 10개의 User API를 프론트엔드에서 호출할 수 있도록 React + TypeScript + Vite 기반 SPA를 구축한다.
현재 프론트엔드는 CRA(react-scripts) 보일러플레이트만 존재하며, CLAUDE.md에 명시된 Vite 기반 스택으로 완전 재구축이 필요하다.

---

## 1단계: 프로젝트 세팅

### package.json 교체
- react-scripts 제거 → vite + @vitejs/plugin-react 추가
- 신규 의존성 추가:
  - `zustand@5`, `react-router-dom@7`, `axios@1`, `react-hook-form@7`, `zod@3`, `react-toastify@11`
  - `tailwindcss@3.4`, `postcss`, `autoprefixer`
  - `@hookform/resolvers`
- devDependencies: `vite@6`, `@vitejs/plugin-react`, `typescript@5`, `eslint@9`

### 설정 파일 생성
- `vite.config.ts`: 포트 3000, `/api → http://localhost:8080` 프록시
- `tsconfig.json` + `tsconfig.app.json` + `tsconfig.node.json`: Vite 호환 설정 (moduleResolution: bundler)
- `tailwind.config.js` + `postcss.config.js`
- `.env`: `VITE_API_BASE_URL=http://localhost:8080`, `VITE_OAUTH2_BASE_URL=/oauth2/authorization`
- `index.html`: Vite 진입점
- `eslint.config.js`: ESLint 9 flat config

---

## 2단계: 디렉토리 구조 생성

```
src/
├── main.tsx                          # React root, BrowserRouter 없음
├── index.css                         # Tailwind 디렉티브
├── vite-env.d.ts                     # Vite 환경변수 타입
├── app/
│   ├── App.tsx                       # 토큰 복원, 로딩 상태
│   └── routes/
│       ├── AppRouter.tsx             # 전체 라우트
│       └── ProtectedRoute.tsx        # 인증 가드
├── global/
│   ├── api/axiosInstance.ts          # 인터셉터 + 자동 토큰 갱신
│   ├── config/env.ts                 # 환경변수 객체
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── pages/
│       ├── HomePage.tsx
│       └── index.ts
├── domain/
│   ├── auth/
│   │   ├── types.ts                  # Request/Response/State 타입
│   │   ├── auth.constants.ts         # API 경로, 스토리지 키
│   │   ├── auth.utils.ts             # 토큰/디바이스 스토리지, JWT 파싱
│   │   ├── api/authApi.ts            # API 호출 함수
│   │   ├── store/useAuthStore.ts     # Zustand 인증 상태
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   ├── SocialLoginButtons.tsx
│   │   │   └── index.ts
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpPage.tsx
│   │   │   ├── OAuth2CallbackPage.tsx
│   │   │   ├── RestoreAccountPage.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   └── user/
│       └── pages/
│           ├── MyPage.tsx
│           ├── EditProfilePage.tsx
│           ├── ChangePasswordPage.tsx
│           ├── DeleteAccountPage.tsx
│           ├── UserProfilePage.tsx
│           └── index.ts
```

---

## 3단계: 핵심 구현 내용

### axiosInstance.ts
- Request 인터셉터: localStorage에서 access token → Bearer 헤더
- Response 인터셉터: 401 → refresh token으로 자동 갱신 → 큐잉 처리
- 갱신 실패 시: 토큰 삭제 + `/login` 리다이렉트

### useAuthStore.ts (Zustand)
- 상태: `user: MyProfileResponse | null`, `accessToken`, `refreshToken`, `isAuthenticated`, `isLoading`
- 액션: `login`, `logout`, `updateUser`, `restoreAuth`

### auth API 호출 함수 (10개 엔드포인트)

| 함수 | 메서드 | 엔드포인트 |
|------|--------|-----------|
| `signup` | POST | /api/auth/signup |
| `login` | POST | /api/auth/login |
| `logout` | POST | /api/auth/logout |
| `refreshTokenApi` | POST | /api/auth/refresh |
| `changePassword` | PATCH | /api/auth/password |
| `getMyProfile` | GET | /api/users/me |
| `updateProfile` | PATCH | /api/users/me |
| `deleteAccount` | DELETE | /api/users/me |
| `recoverAccount` | POST | /api/users/recover |
| `getUserProfile` | GET | /api/users/{username} |

### 백엔드 응답 구조
```typescript
interface ApiResponse<T> {
  status: { code: number; message: string }
  data: T
}
```

### 라우트 구성

| 경로 | 컴포넌트 | 인증 필요 |
|------|---------|---------|
| `/` | HomePage | ✗ |
| `/login` | LoginPage | ✗ |
| `/signup` | SignUpPage | ✗ |
| `/restore` | RestoreAccountPage | ✗ |
| `/oauth2/callback` | OAuth2CallbackPage | ✗ |
| `/users/:username` | UserProfilePage | ✗ |
| `/me` | MyPage | ✓ |
| `/me/edit` | EditProfilePage | ✓ |
| `/me/password` | ChangePasswordPage | ✓ |
| `/me/delete` | DeleteAccountPage | ✓ |

### 폼 검증 (Zod 스키마)
- 회원가입: email, password(8+자), nickname(2-20자), username(3-20자, 소문자/숫자/밑줄)
- 로그인: email, password
- 비밀번호 변경: currentPassword, newPassword(8+자)
- 프로필 수정: nickname(2-20자), bio(200자 이하)
- 계정 복구: email, password

---

## 4단계: 검증

```bash
npm install   # 의존성 설치
npm run build # tsc -b && vite build (빌드 성공 확인)
npm run lint  # ESLint 오류 없음 확인
npm run dev   # 개발 서버 실행 확인 (포트 3000)
```

---

## 결과

| 검증 항목 | 결과 |
|----------|------|
| `npm install` | ✅ 275 packages |
| `npm run build` | ✅ 137 modules, dist 생성 |
| `npm run lint` | ✅ 0 errors |
