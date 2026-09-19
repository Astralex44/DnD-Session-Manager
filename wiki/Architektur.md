# Architektur

Zusammenfassung von Pflichtenheft Kapitel 8. Bei Widersprüchen gilt das Pflichtenheft.

## Backend-Stack

- **ASP.NET Core (C#)** als Web-API
- **Entity Framework Core** als ORM
- **PostgreSQL** als Datenbank
- **Schichtarchitektur**: Controller → Facade (`IFacade`) → Repository (`IRepository`) → UnitOfWork. Controller bleiben
  dünn (nur HTTP-Handling), die Geschäftslogik liegt in den Facades. Repositories kapseln den EF-Core-Zugriff, ein
  Interface pro Entität. Generelle Backend-Präferenz von Severin, nicht projektspezifisch.

## Frontend-Stack

- **React** (mit Vite als Build-Tool)
- **React Router** fürs Client-seitige Routing
- **Zustand** für State-Management

## Echtzeit, Auth, Storage

- **Echtzeit:** ein SignalR-Hub für alle live-synchronisierten Bereiche (Initiative, Würfel, Timer, Kartenfreigaben,
  Shop-Freigaben, Notifications)
- **Auth:** Discord OAuth2, eigene JWTs für die Session, Zugriff über eine vom DM gepflegte Liste erlaubter
  Discord-Benutzer
- **Datei-Storage:** PDFs/Bilder (Karten, Charakterbögen, Monster, Bücher) liegen auf einem Docker-Volume, ausgeliefert
  ausschliesslich über einen authentifizierten Endpoint, der die Freigabe-Logik vor jedem Zugriff prüft — kein direkter
  statischer Zugriff auf Dateien

## Deployment

Docker Compose mit mindestens drei Diensten: `api` (ASP.NET Core), `db` (PostgreSQL), Reverse Proxy für TLS. Läuft auf
einem beliebigen eigenen Server, komplett unabhängig von einem Drittanbieter-Dienst. Kein BaaS (weder Supabase noch
ähnliches), bewusste Entscheidung für volle Kontrolle.

## Referenzimplementierung

Ein erster vertikaler Durchstich (Entität `Quote`, komplett durch alle vier Schichten) existiert bereits im Repo unter
`src/backend` und `src/frontend` und dient als Vorlage für jede weitere Entität. Details: `GETTING_STARTED.md` im
Repo-Root, vollständiger Bauplan für den Rest: `CLAUDE_CODE_BRIEF.md`.

## Seitenstruktur

```
/login                    Discord OAuth
/                          Dashboard
/board                     Live-Session (Panel-Layout, siehe unten)
/characters                Charakter-Übersicht (Umschalter, neuen Charakter anlegen)
/character/:id             Charakterbogen, voll editierbar
/notes                     Private Notizen
/manage                    nur DM
  /manage/maps
  /manage/monsters
  /manage/shops
  /manage/books
  /manage/quotes
  /manage/sessions
  /manage/settings
```

`/board` statt `/table`, um Verwechslungen mit Datenbank-Tabellen im Code zu vermeiden.

## Ansichtswechsel (DM ↔ Spieler)

`/board` ist für DM und Spieler dieselbe Route, Rendering hängt von der Rolle ab. Ausgelöst wird der Wechsel im
CharacterPanel: der DM sieht dort alle Charaktere mit einem "Ansehen"-Button, ein Klick wechselt in die jeweilige
Spieler-Ansicht, ohne Reload/Logout. Zurück geht's über einen "Zurück zur DM-Ansicht"-Button im Header, der nur sichtbar
ist, wenn man gerade in einer Spieler-Ansicht ist. Technisch über einen `viewingAsUserId`-State (z. B. Zustand), der DM
bleibt als er selbst authentifiziert.

## Board-Panels

**DM-Ansicht:** InitiativePanel, DicePanel, MonsterPanel, TimerPanel, MapPanel, SessionNotesPanel, NotesPanel,
ShopPanel, CharacterPanel

**Spieler-Ansicht:** CharacterPanel (eigene Charaktere, editierbar), NotesPanel, DicePanel (nur eigene Würfe),
MapPanel (mit Ein-/Ausblenden/Sperren), InitiativePanel (nur lesend)

Panels statt Tabs, weil der DM immer am Laptop sitzt und während einer Session oft schnell hintereinander mehrere Werte
nachtragen muss (Hybrid-Modus, physisches + digitales Spiel gemischt).

## Frontend-Sprachkonvention

Routen, Komponentennamen, Variablen: Englisch. Sichtbare Texte in der UI: ebenfalls Englisch (Kurswechsel gegenüber der
ursprünglichen Planung — nur die Projektdokumentation selbst, also README/Wiki/Lastenheft/Pflichtenheft, bleibt vorerst
Deutsch).

## UI-Komponenten

Kein natives `<select>` irgendwo im Frontend — jedes Dropdown ist eine selbst gestylte `.custom-select`-Komponente (
Trigger-Button + Popover-Menü), Referenzmuster in den Mockups. Farbpalette (Amber/Pergament) und Schriftarten sind als
CSS-Variablen definiert, siehe [[Screens und Mockups]].