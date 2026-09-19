# Setup

Ein erster vertikaler Durchstich existiert bereits im Repo (Quote-Entität, komplett durch alle
Schichten). Diese Seite beschreibt, wie man ihn lokal zum Laufen bringt. Ausführlichere Version
mit Troubleshooting: `GETTING_STARTED.md` im Repo-Root.

## Docker Compose

```yaml
services:
  api:
    build:
      context: ./src/backend/DndSessionManager.Api
      dockerfile: Dockerfile
    ports:
      - "5001:8080"
    environment:
      - ConnectionStrings__Default=Host=db;Port=5433;Database=dnd_session_manager;Username=postgres;Password=postgres
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=dnd_session_manager
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
```

Ein Reverse Proxy für TLS kommt dazu, sobald es um echtes Deployment statt lokaler Entwicklung geht.

## Vorausgesetzt

- Docker & Docker Compose
- .NET SDK 8 (für Backend-Entwicklung ausserhalb des Containers, inkl. `dotnet-ef` für Migrationen)
- Node.js (für Frontend-Entwicklung, React + Vite)

## Lokal starten

```bash
docker compose up db -d

cd src/backend
dotnet restore && dotnet build
cd DndSessionManager.Api
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run                      # http://localhost:5000, Swagger unter /swagger

# zweites Terminal
cd src/frontend
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173
```

## Wichtig

Das Backend wurde ohne verfügbares .NET SDK geschrieben (Entwicklungsumgebung ohne `dotnet`).
Der erste `dotnet build` sollte deshalb bewusst als Kontrollschritt behandelt werden, nicht nur
als Formalität.

## Discord-App für lokale Entwicklung

Für den OAuth-Flow wird eine eigene Discord-Application mit Redirect-URI auf `localhost` benötigt,
siehe [Discord Developer Portal](https://discord.com/developers/applications). Details folgen,
sobald der Auth-Flow implementiert ist (nächster grosser Schritt laut Build-Reihenfolge in
`CLAUDE_CODE_BRIEF.md`).

## Nächste Schritte

Siehe `CLAUDE_CODE_BRIEF.md`, Abschnitt 10: `Character` als nächste Entität (grösste, zentralste),
danach `Map`/`MapShare`, dann `Shop`/`Purchase`, dann `Session`-Werkzeuge inkl. SignalR, dann Auth.