# CLAUDE.md

## Geekyard Backend

Anime community platform — Spring Boot backend.

## Rules

Always-enforced constraints are auto-loaded from `.claude/rules/`:
- `security.md` — JWT, OAuth2, BCrypt, Redis, CORS, S3
- `testing.md` — JUnit 5, MockMvc, Given-When-Then, required test cases
- `git-convention.md` — commit format, branching strategy

## Skills

Reference docs in `.claude/skills/`. Load the relevant file when needed:

| Skill | File | Contents |
| ----- | ---- | -------- |
| Setup & Commands | [backend-setup](.claude/skills/backend-setup/SKILL.md) | Gradle commands, tech stack |
| Structure & Conventions | [backend-structure](.claude/skills/backend-structure/SKILL.md) | DDD package layout, Entity/DTO/DI rules |
| API & Exceptions | [backend-api](.claude/skills/backend-api/SKILL.md) | ApiResponse format, ErrorCode/GlobalExceptionHandler |
| Recipes | [backend-recipes](.claude/skills/backend-recipes/SKILL.md) | New domain, endpoint, exception, test templates |
