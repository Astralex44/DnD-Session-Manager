# API access tests

End-to-end checks of the login and ownership rules against a locally running API: curl with cookie jars, one
check per line, `passed N, failed M` at the end. Run them before tagging a release that touches auth, sharing,
characters or notes.

**They wipe tables in the local dev database** (container `dnd-postgres`) to start from a known state. They only
ever talk to `localhost` — never point them at production.

## Running

```bash
# 1. Local database (from src/backend)
docker compose up -d postgres

# 2. API in Development, with a fake DM ID and dummy Discord credentials
#    (dummy credentials make the Discord scheme register, so the failed-login redirect can be checked)
cd src/backend/DndSessionManager.Api
ASPNETCORE_ENVIRONMENT=Development Auth__DmDiscordId=111 \
Authentication__Discord__ClientId=dummy Authentication__Discord__ClientSecret=dummy \
ASPNETCORE_URLS=http://localhost:5001 dotnet run

# 3. In another shell, from the repo root
scripts/api-tests/access-matrix.sh      # who gets in, DM-only vs member endpoints, files, hub, failed-login redirect
scripts/api-tests/ownership-matrix.sh   # characters/notes per account, note adoption, sharing, purchases, filtering
```

Both log in through `GET /api/auth/dev-login?discordId=…&handle=…`, which only exists in Development and runs the
same rules as the Discord login (`AuthFacade.SignInAsync`).

`hub-join.cjs` checks that the SignalR hub refuses non-members:
`node scripts/api-tests/hub-join.cjs src/frontend/node_modules/@microsoft/signalr <cookie jar> <gameId>`.
