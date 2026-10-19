# DnD Session Manager

A self-hosted tool for running D&D sessions: a live **Board** for game night (initiative, dice, maps, shops, timers,
monsters, notes) that updates for everyone at the table without reloading, full 5e **character sheets** that belong
to their players, and the DM's setup pages for between sessions.

It grew out of a classic requirements/specification process, with the group's DM as the client. Live at
[dnd.astralex.dev](https://dnd.astralex.dev), invite-only, still released as alpha.

## Stack

| Area       | Technology                                       |
|------------|--------------------------------------------------|
| Backend    | ASP.NET Core 8 (C#), Entity Framework Core       |
| Database   | PostgreSQL                                       |
| Real-time  | SignalR                                          |
| Frontend   | React, Vite, React Router, Zustand               |
| Auth       | Discord OAuth, cookie session, invite-only       |
| Deployment | Docker Compose behind Caddy, self-hosted         |

How it fits together and why: the [wiki](wiki/Home.md), especially [Architecture](wiki/Architecture.md) and the
[Decision Log](wiki/Decision-Log.md).

## Status

Every requirement from the specification is built (see the [Feature Overview](wiki/Feature-Overview.md)). Changes per
release are in the [CHANGELOG](CHANGELOG.md).

## Documentation

| Document                                                        | What it is                                                      |
|-----------------------------------------------------------------|-----------------------------------------------------------------|
| [DM Guide](docs/guides/DM-Guide.pdf), [Player Guide](docs/guides/Player-Guide.pdf) | How to use the tool, for the DM and for players  |
| [Wiki](wiki/Home.md)                                            | Architecture, data model, features, decisions, setup            |
| [CHANGELOG](CHANGELOG.md)                                       | What changed in which release                                   |
| [Lastenheft](docs/DnD_Tool_Lastenheft.docx)                     | Requirements from the DM's (client's) point of view, the "what" (German) |
| [Pflichtenheft](docs/DnD_Tool_Pflichtenheft.docx)               | Technical specification, the "how" (German)                     |
| [Functional specification](docs/DnD_Tool_Funktionale_Spezifikation.docx) | Detailed functional spec (German)                       |
| [ERD](docs/DnD_Tool_ERD_New_Version.drawio)                     | The planned data model (open with draw.io)                      |
| [Mockups](docs/mockups/)                                        | Interactive HTML mockups of the planned screens                 |

## Local development

```bash
cd src/backend && docker compose up -d --build     # API on :5001, Postgres on :5433
cd src/frontend && npm install && cp .env.example .env && npm run dev   # app on :5173
```

Discord login, the dev login for tests, the test suites and releases: see [Setup](wiki/Setup.md).

## Language

Everything is in English — code, UI, docs, wiki and changelog — except the three Word specifications, which stay
German.
