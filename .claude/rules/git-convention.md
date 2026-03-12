# Git Commit & Branching Convention

## Format

```
[<type>] <scope>: <short summary>
```

- **type** → category of change
- **scope** → optional, module/domain affected
- **summary** → concise description in imperative mood

### Types

- **feat** → new feature
- **fix** → bug fix
- **docs** → documentation changes
- **style** → formatting, linting, no logic changes
- **refactor** → code restructuring without behavior change
- **perf** → performance improvement
- **test** → adding or modifying tests
- **build** → build system or dependencies
- **ci** → CI/CD configuration
- **chore** → maintenance tasks

### Examples

```
[feat] auth: add email verification flow
[fix] user: resolve profile image upload bug
[docs] readme: update setup instructions
[style] global: apply Tailwind class ordering
[refactor] chat: simplify message store logic
```

---

## Branching Strategy

### Branch Model

- **main** → stable release branch (production)
- **dev** → integration branch (all features merged here before release)
- **feature branches** → created per feature/task

### Naming Convention

```
feat/<module>-<short-description>
```

Examples:

- `feat/auth-email-verification`
- `feat/user-profile-edit`

### Workflow

1. **Create feature branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feat/auth-email-verification
   ```
2. **Develop feature**
   - Commit using `[type] scope: summary` format.
   - Push branch to remote.
3. **Merge into dev**
   - Open PR from `feat/...` → `dev`.
   - Code review + lint/test checks must pass.
   - Merge via squash or rebase to keep history clean.
4. **Release**
   - When `dev` is stable, merge into `main`.
   - Tag release version (e.g., `v1.0.0`).

### Rules

- One feature per branch → one PR.
- Branch names must start with `feat/`, `fix/`, `docs/`, etc.
- Never commit directly to `dev` or `main`.
- PR must be reviewed before merge.
- CI/CD runs on `dev` and `main` only.
