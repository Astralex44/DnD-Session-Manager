# Architecture

A summary of Pflichtenheft chapter 8, updated to how it was actually built. Where the two disagree, the code is right
and this page should say so.

## Backend

- **ASP.NET Core 8 (C#)** web API, **Entity Framework Core** with **PostgreSQL** (Npgsql).
- **Layers:** Controller → Facade (`I…Facade`) → Repository (`I…Repository`) → UnitOfWork. Controllers stay thin
  (HTTP only), business logic lives in the facades, repositories wrap EF Core with one interface per entity. This is
  Severin's general backend preference, not specific to this project.
- **Migrations** are applied automatically when the API starts.
- **Character sheet PDF** export with QuestPDF (`Pdf/`).

## Frontend

- **React** with **Vite**, **React Router**, **Zustand** for state.
- One app shell for everyone: header, a sidebar and the page. The DM's setup pages are an expandable **Manage** group
  in the same sidebar, so the Board is always one click away during a session.
- No native `<select>` anywhere: every dropdown is the custom-styled `CustomSelect` (trigger button plus popover).
  Colours (amber/parchment) and fonts are CSS variables in `src/frontend/src/index.css`.
- All code, routes and visible text are English. Only the Word specifications stay German.

## Auth

- **Discord OAuth2** → an **HTTP-only cookie** session (no JWTs). The API never redirects an API call to Discord;
  an unauthenticated call gets a plain 401. Only `/api/auth/login` starts the Discord flow.
- **Who gets in:** the DM is fixed by configuration (`Auth:DmDiscordId`). Everyone else needs an invite by Discord
  username from the DM (Manage → Players); without one, login ends on the "You're not invited yet" page.
- **Authorisation on the server:** policies `GameMember` and `GameDm` on every game route, plus a
  `[CharacterAccess(Read | Owner)]` attribute on character routes. A character can be edited only by its owner —
  the DM can read every sheet but change none.
- **Data-protection keys** are stored in Postgres, so logins survive container rebuilds.
- In Development only, `GET /api/auth/dev-login?discordId=…&handle=…&returnUrl=/` signs in without Discord, for
  tests.

## Real-time

One SignalR hub at `/hubs/game`. Joining a game's group checks membership first. The server broadcasts "this changed"
events per area (characters, initiative, timers, maps, shops, …), and the frontend refetches what it shows
(`useLiveFetch`), so every panel updates live without a reload.

## Files

Maps, books and monster stat blocks (PNG/JPG/WEBP/PDF) live in the `uploads` volume, never served statically. They go
out through `/api/files/documents/{name}` and `/api/files/monsters/{name}`, which check access on every request: a
document needs the DM or a player with one of their own characters on its share list; a monster file needs the DM.
An unknown file returns 404 before any role check, so nothing reveals which files exist.

## Deployment

Self-hosted, no backend-as-a-service. `docker-compose.prod.yml` runs `postgres`, `backend` (API on port 61300) and
`frontend` (nginx with the built app on port 61310) on a Hetzner server. Caddy on the host terminates TLS and proxies
`dnd.astralex.dev` → frontend and `dnd-api.astralex.dev` → backend. Secrets sit in a gitignored `.env` on the server
(template: `.env.example`).

Releases go out by tag: pushing `vMAJOR.MINOR.PATCH-alpha` runs `.github/workflows/deploy.yml`, which checks the tag
out on the server and rebuilds with `docker compose -f docker-compose.prod.yml up -d --build`.

## Routes

```
/login                Discord login
/not-invited          shown when a login has no invite
/                     Dashboard
/board                live session (panels, see below)
/characters           character list; a player's sidebar link goes straight to their active character
/characters/new       character creation wizard
/character/:id        character sheet (editable by its owner only)
/notes                private notes
/help                 help
/manage/...           DM only: documents, monsters, shops, quotes, sessions, players, settings
```

`/board` rather than `/table`, so it can't be confused with database tables in the code.

## Board

`/board` is the same route for DM and players; what it shows depends on the role.

- **DM:** Characters, Initiative, Dice, Timer, Monsters, Shop, Maps, Session Notes, My Notes, Calculator.
- **Player:** their character, Dice (their own rolls only), Initiative (read-only), Timer, Shop (shops shared with
  them), Maps (with hide, lock and hand-on), My Notes, Calculator.

Panels rather than tabs, because the DM sits at a laptop and often enters several values in quick succession during
hybrid play. **View as** in the DM's Characters panel shows the Board exactly as that player sees it, without logging
out; "Back to DM view" returns. The DM stays signed in as themselves the whole time, so the player's notes, dice
history and sheet stay private and read-only.
