# Skill: docker-up

Start, stop, and manage the Docker Compose environment for the Mock Exam System.

## Services

| Service | Image | Port | Role |
|---------|-------|------|------|
| `db` | mysql:8.0 | 3306 | MySQL database |
| `backend` | custom PHP 8.2 | 8000 | Laravel API |
| `frontend` | custom Node 20 | 5173 | Vite dev server |

## Start the environment

```bash
docker compose up --build        # first run — build images and start
docker compose up -d             # subsequent runs — start in background
docker compose up -d --build     # rebuild images and start in background
```

## Stop

```bash
docker compose down              # stop and remove containers (data volume preserved)
docker compose down -v           # stop and remove containers AND wipe db_data volume
```

## Applying config changes

`docker compose restart <service>` only restarts the process — it does NOT apply
changes to environment variables, volume mounts, or port mappings from
`docker-compose.yml`. To apply those changes:

```bash
docker compose up -d --force-recreate <service>   # recreate with new config
docker compose up -d --force-recreate             # recreate all services
```

## First-run checklist

1. Copy and fill secrets:
   ```bash
   cp .env.example .env
   # edit .env — set APP_KEY and JWT_SECRET
   ```
2. Start services: `docker compose up --build -d`
3. Run migrations: `docker compose exec backend php artisan migrate`
4. Seed sample data (optional): `docker compose exec backend php artisan db:seed`

## Common operations

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run artisan commands
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed
docker compose exec backend php artisan cache:clear
docker compose exec backend php artisan config:clear

# Open a shell
docker compose exec backend bash
docker compose exec db mysql -umock_exam -psecret mock_exam

# Check all service status
docker compose ps
```

## Networking rules

- Inside the Docker network, services talk to each other by **service name**:
  - Backend → database: `DB_HOST=db`
  - Vite proxy → backend: `BACKEND_URL=http://backend:8000`
- `localhost` inside any container means **that container itself** — never the host or a sibling service
- Ports `8000` and `5173` are published to the host so the browser can reach them

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `ECONNREFUSED` from Vite proxy | `BACKEND_URL` not set or wrong | `--force-recreate frontend` |
| `Connection refused` from Laravel | `DB_HOST=127.0.0.1` in `backend/.env` | Change to `DB_HOST=db` |
| `Nothing to migrate` but table missing | Config cached with wrong DB host | `php artisan config:clear` then retest |
| Env var change has no effect | Used `restart` instead of `--force-recreate` | `docker compose up -d --force-recreate <service>` |
| `500` on all API calls | Cache/session table missing | `docker compose exec backend php artisan migrate` |
