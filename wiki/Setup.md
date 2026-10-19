# Setup

How to run the app locally, test it and ship a release.

## Requirements

- Docker with Docker Compose
- .NET SDK 8 (only to run the API outside Docker, or to add migrations with `dotnet-ef`)
- Node.js 22 for the frontend

## Run it locally

```bash
# API (port 5001) and Postgres (port 5433) in Docker
cd src/backend
cp .env.example .env            # optional: fill in for real Discord login, see below
docker compose up -d --build

# Frontend (port 5173), in a second terminal
cd src/frontend
npm install
cp .env.example .env            # VITE_API_BASE_URL=http://localhost:5001/api
npm run dev
```

Open http://localhost:5173. Migrations run when the API starts, so a fresh database is ready right away. Swagger is
at http://localhost:5001/swagger.

## Discord login locally

Without Discord settings the login page says Discord isn't set up; everything else still works. For real login:

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications). Under
   OAuth2, add the redirect `http://localhost:5001/api/auth/discord/callback`. Scopes needed: `identify` only.
2. Put its client ID and secret in `src/backend/.env`, plus your own Discord user ID as `DND_DM_DISCORD_ID` so you're
   the DM (Discord → Settings → Advanced → Developer Mode, then right-click yourself → Copy User ID).
3. `docker compose up -d` again so the container picks them up.

Running the API with `dotnet run` instead of Docker? The same values go into user-secrets
(`Authentication:Discord:ClientId`, `Authentication:Discord:ClientSecret`, `Auth:DmDiscordId`); the `.env` file
only feeds the container.

**Without Discord at all:** in Development the API has
`GET /api/auth/dev-login?discordId=…&handle=…&returnUrl=/`, which signs in as that Discord account (the DM if the ID
matches `Auth:DmDiscordId`, otherwise only if invited). It doesn't exist outside Development.

## Tests

`scripts/api-tests/` holds end-to-end checks of the login, access and ownership rules (curl, one check per line).
Run them before tagging a release that touches auth, sharing, characters or notes. They wipe tables in the database
they point at, so run them against a separate test stack — the [README there](../scripts/api-tests/README.md)
explains how. Build checks: `dotnet build` in `src/backend`, `npm run build` and `npm run lint` in `src/frontend`.

## Releases

1. Update [CHANGELOG.md](../CHANGELOG.md): move "Unreleased" to a new version heading with the date.
2. Tag and push: `git tag vMAJOR.MINOR.PATCH-alpha && git push origin main --tags` — minor for features, patch for
   fixes.
3. The tag runs `.github/workflows/deploy.yml`, which checks the tag out on the server and rebuilds
   (`docker compose -f docker-compose.prod.yml up -d --build`). See [Architecture](Architecture.md#deployment).

Production configuration lives in a gitignored `.env` on the server; `.env.example` at the repo root lists the
variables. Its Discord app needs the redirect `https://dnd-api.astralex.dev/api/auth/discord/callback`.
