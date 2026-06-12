# Skill: git-commit

Stage and commit changes following this project's conventions.

## Steps

1. Run `git status` and `git diff` in parallel to see what changed.
2. Run `git log --oneline -5` to match the existing commit message style.
3. Stage relevant files — prefer named files over `git add -A` to avoid
   committing `.env`, build artefacts, or unrelated changes.
4. Write a commit message:
   - Subject line: imperative mood, ≤ 72 chars (e.g. "add Docker support")
   - Use "add" for new features, "fix" for bugs, "update" for enhancements,
     "remove" for deletions, "refactor" for restructuring
   - No period at the end of the subject line
   - Body is optional — only when the *why* needs explanation
5. Commit using a HEREDOC to preserve formatting.
6. Run `git status` afterwards to confirm a clean tree.

## Rules

- **Never commit** `.env`, `backend/.env`, or any file containing secrets
- **Never commit** `node_modules/`, `vendor/`, `dist/`, or build output
- **Never use** `--no-verify` unless the user explicitly asks
- **Never amend** a published commit — create a new one instead
- **Never push** unless the user explicitly asks
- Always include the co-author trailer:
  `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

## Commit message format

```
<type>(<optional scope>): <short description>

<optional body — explain WHY, not WHAT>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

### Examples

```
add Docker support for frontend and backend services

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

```
fix DB_HOST in backend .env to use Docker service name

Previously pointed to 127.0.0.1 which is the container loopback,
not the db service. Updated to "db" so Docker DNS resolves correctly.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## Bash template

```bash
git commit -m "$(cat <<'EOF'
type: short description

Optional body.
"
```

## Files to always exclude

| Path | Reason |
|------|--------|
| `backend/.env` | Contains APP_KEY, JWT_SECRET, DB credentials |
| `.env` | Root Docker Compose secrets |
| `frontend/node_modules/` | Dependency cache — not source |
| `backend/vendor/` | Composer packages — not source |
| `frontend/dist/` | Build output |
| `backend/storage/logs/*.log` | Runtime logs |
| `backend/bootstrap/cache/*.php` | Generated cache files |
