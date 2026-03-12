# Frontend 테마 전환 및 이메일 인증 UI 구현 계획

**날짜**: 2026-03-12
**상태**: 완료

---

## Context

CLAUDE.md 업데이트에 따른 전체 프론트엔드 수정:
1. 플랫폼: 웨딩 초대장 → **Anime community platform**
2. 테마: blue/gray 하드코딩 → **CSS 커스텀 프로퍼티 기반 테마 시스템**
3. Zod 3 → **Zod 4** 업그레이드
4. **이메일 인증 버튼** UI 추가 (백엔드 미구현, UI 선행 개발)

---

## Phase 1: 의존성 업그레이드

```json
"zod": "^4.0.0"
"@hookform/resolvers": "^3.10.0"
```

### Zod 4 마이그레이션 주의사항
- `import { z } from 'zod'` 변경 없음
- `.email()`, `.min()`, `.max()`, `.regex()` API 변경 없음
- 모든 에러 메시지가 커스텀 한국어로 지정되어 있어 기본 메시지 변경 영향 없음

---

## Phase 2: 테마 시스템

### CSS 변수 (RGB 채널 형식 — Tailwind opacity modifier 지원)

```css
:root {
  --primary:     162 82 194;   /* #A252C2 */
  --secondary:   245 166 35;   /* #F5A623 */
  --accent:      74 144 226;   /* #4A90E2 */
  --background:  253 253 254;  /* #FDFDFE */
  --surface:     255 255 255;  /* #FFFFFF */
  --content:     44 44 44;     /* #2C2C2C  (text-primary) */
  --subtle:      110 110 110;  /* #6E6E6E  (text-secondary) */
  --success:     39 174 96;    /* #27AE60 */
  --error:       231 76 60;    /* #E74C3C */
}
@media (prefers-color-scheme: dark) { ... }
```

### Tailwind 색상 확장

```js
colors: {
  primary:    'rgb(var(--primary)    / <alpha-value>)',
  secondary:  'rgb(var(--secondary)  / <alpha-value>)',
  accent:     'rgb(var(--accent)     / <alpha-value>)',
  background: 'rgb(var(--background) / <alpha-value>)',
  surface:    'rgb(var(--surface)    / <alpha-value>)',
  content:    'rgb(var(--content)    / <alpha-value>)',
  subtle:     'rgb(var(--subtle)     / <alpha-value>)',
  success:    'rgb(var(--success)    / <alpha-value>)',
  error:      'rgb(var(--error)      / <alpha-value>)',
}
```

### 클래스 교체 규칙

| 기존 | 교체 |
|------|------|
| `bg-blue-600` | `bg-primary` |
| `hover:bg-blue-700` | `hover:bg-primary/90` |
| `text-blue-600` | `text-primary` |
| `focus:ring-blue-500` | `focus:ring-primary` |
| `bg-gray-50` | `bg-background` |
| `bg-white` | `bg-surface` |
| `text-gray-700` / `text-gray-900` | `text-content` |
| `text-gray-500` / `text-gray-600` | `text-subtle` |
| `border-gray-300` | `border-content/20` |
| `text-red-500` / `text-red-600` | `text-error` |
| `bg-red-600` | `bg-error` |
| `bg-red-50` | `bg-error/10` |

---

## Phase 3: 이메일 인증 UI

### 신규 파일: `EmailVerification.tsx`

```
상태: 'idle' | 'sent' | 'verified'

[인증 메일 발송] 버튼
  → 이메일 형식이 유효할 때만 활성화
  → 백엔드 미구현: toast 안내 후 유지

[인증 코드 입력] + [확인] 버튼 (status === 'sent' 시 표시)

"✓ 이메일 인증 완료" 배지 (status === 'verified' 시 표시)
```

### 엔드포인트 (백엔드 준비 시 연동)
- `POST /api/auth/email/verify` — 인증 메일 발송
- `POST /api/auth/email/confirm` — 인증 코드 확인

---

## Phase 4: 검증

```bash
npm install
npm run build   # tsc -b && vite build
npm run lint    # 0 errors
```

---

## 결과

| 항목 | 결과 |
|------|------|
| Zod 4 업그레이드 | ✅ |
| CSS 변수 테마 시스템 | ✅ |
| Tailwind 커스텀 색상 | ✅ |
| 전체 컴포넌트 테마 적용 | ✅ |
| 이메일 인증 UI | ✅ (백엔드 연동 대기) |
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
