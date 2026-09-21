# Docker deploy

## Local run from repository root

```bash
cp .env.example .env
docker compose up --build
```

Backend health: `http://localhost:8081/api/v1/actuator/health`

The default database is Neon. Set these values in the root `.env`:

```env
DB_URL=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require
DB_USERNAME=neondb_owner
DB_PASSWORD=...
```

Local Postgres is available only when explicitly enabled:

```bash
docker compose --profile local-db up -d postgres
```

## Server run

1. Copy the repository to the server.
2. Copy `.env.example` to `.env`.
3. Set `APP_FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to the Vercel frontend URL.
4. Fill secrets in `.env`.
5. Build and start:

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

The frontend is deployed separately on Vercel. Configure its `NEXT_PUBLIC_API_URL`
in Vercel to point to the backend URL, for example:
`http://SERVER_IP_OR_DOMAIN:8081/api/v1`.

Also configure the AI agent URL for the practical voice interview:
`NEXT_PUBLIC_AGENT_API_URL=http://SERVER_IP_OR_DOMAIN:8001`.
