## Coding Conventions

- **No unused variables allowed** — applies to imports, `const`, `let`, and function parameters. Remove any declaration that is not used.
- **Components**: use the format `const Component: FC<Props> = () => {}`
- **Types**: define with `interface`, placed in `types.ts`
- **Styling must use Tailwind utility classes only** — inline `style` attributes are forbidden.
- **API constants**: define in `{module}.constants.ts` as `as const` objects
- **API calls**: `{module}Api.ts` → `axiosInstance` → backend
- **Loading state**: use `isSubmitting` / `isSending` flags + disable buttons
- **Import order**: external libraries first → internal modules
- **Error handling**: `try/catch` + `isAxiosError` + branch by status code
- **Forms must use React Hook Form + Zod** — local state for form management is prohibited.
- **Form validation**: Zod schema + async duplicate check on `onBlur` (email, nickname)
- **File upload**: `FormData` + `axiosInstance`
- **OAuth2 flow**: SocialLoginButtons → backend OAuth2 URL → receive token in callback
- **Environment variables must use the `VITE_` prefix** — managed via the `ENV` object in `global/config/env.ts`.
- **Types must be defined with `interface` in each domain’s `types.ts`** — avoid declaring types inside component files.
- **Run `npm run lint` after coding** — work is considered complete only if lint passes with no errors.

## Checklist (new domain)

1. Create `domain/{module}/` with api, pages, types
2. Keep `index.ts` barrel exports
3. Add route in `AppRouter.tsx`
4. Wrap protected pages with `ProtectedRoute`
5. Add `store/use{Module}Store.ts` if needed
6. Place global components in `global/components/`
