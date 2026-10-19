# Docker deploy

## Local run from repository root

```bash
cp .env.example .env
docker compose up --build
```

Backend health: `http://localhost:8081/api/v1/actuator/health`

The default database is Supabase PostgreSQL. Set these values in the root `.env`:

```env
DB_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
FLYWAY_URL=jdbc:postgresql://aws-0-us-west-1.pooler.supabase.com:5432/postgres?sslmode=require&prepareThreshold=0
DB_USERNAME=postgres.ttcxfhzulxmmxguzphjw
DB_PASSWORD=...
```

Application queries use the transaction pooler (6543); Flyway uses the session
pooler (5432) for migration locks. Flyway creates tables and seed data on startup.
For a new Supabase project, leave the public schema empty before the first run.
No data or connection to the previous database is required.

To apply migrations independently after packaging the backend JAR:

```bash
python scripts/initialize-database.py
```

Local Postgres is available only when explicitly enabled:

```bash
docker compose --profile local-db up -d postgres
```

## Server run

1. Copy the repository to the server.
2. Copy `.env.example` to `.env`.
3. Set `APP_FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to the frontend URL.
4. Fill secrets in `.env`. For AI autocomplete/suggestions, set both providers to DeepSeek and paste the same key once:

```env
AI_PROVIDER=deepseek
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
MOCK_LLM=false
```

5. Build and start:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

## Updating production images

After pushing a new backend/agent image or pulling new source on the server:

```bash
docker compose down
docker compose pull
docker compose up -d --build --force-recreate
docker compose ps
```

Verify that DeepSeek is present in the backend and agent containers without printing the secret:

```bash
docker compose exec backend sh -lc 'test -n "$DEEPSEEK_API_KEY" && echo "backend DeepSeek OK" || echo "backend DeepSeek MISSING"'
docker compose exec ai-agent sh -lc 'test -n "$DEEPSEEK_API_KEY" && echo "agent DeepSeek OK" || echo "agent DeepSeek MISSING"'
```

Useful logs:

```bash
docker compose logs -f backend
docker compose logs -f ai-agent
```

The frontend is deployed separately on Vercel. For the public HTTPS site configure:

```env
NEXT_PUBLIC_API_URL=https://api.achanvear.site/api/v1
NEXT_PUBLIC_AGENT_API_URL=https://api.achanvear.site
```

The API reverse proxy must route `/api/v1/` to Java (8081) and
`/practical-interview/`, its WebSocket, and `/code-runner/` to Python (8001).
An Nginx include for the Python routes is provided in
`deploy/nginx/agent-routes.conf`; include it inside the existing HTTPS server
block. Validate with `sudo nginx -t` before reloading Nginx. If Nginx itself runs
in Docker, use the agent's Docker service address instead of 127.0.0.1:8001.

After deploying, `/agent-health` must return the Python health response and
`/practical-interview/start` must reach FastAPI (a GET returns 405, not Java 404).
WebSocket upgrade headers must reach Python for voice conversation to work.

Rebuild the agent to install edge-tts 7.3.1 and redeploy the frontend to load
changed NEXT_PUBLIC environment values. A frontend redeploy alone does not
update the server proxy or the Python image.

Use `http://localhost:8001` only for local development. Production requires an
HTTPS agent endpoint with WSS support; HTTPS pages cannot use an HTTP agent.
