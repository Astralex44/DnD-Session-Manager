# DnD Session Manager

Selbst gehostetes Tool zur Verwaltung von D&D-Sessions: ein Live-Board für den eigentlichen Spielabend (Initiative,
Würfel, Karten, Shops, Timer, Notizen) und eine Verwaltungsoberfläche für den Spielleiter zwischen den Sessions.

Entstanden aus einer klassischen Lastenheft/Pflichtenheft-Planung, der Spielleiter der Gruppe ist der Auftraggeber.

## Stack

| Bereich    | Technologie                              |
|------------|------------------------------------------|
| Backend    | ASP.NET Core (C#), Entity Framework Core |
| Datenbank  | PostgreSQL                               |
| Echtzeit   | SignalR                                  |
| Frontend   | React, Vite, React Router, Zustand       |
| Auth       | Discord OAuth/OIDC                       |
| Deployment | Docker Compose, selbst gehostet          |

Details und Begründungen: [Pflichtenheft](docs/Pflichtenheft.docx), Kapitel 8.

## Status

Planung abgeschlossen, keine offenen Design-Entscheidungen mehr. Umsetzung hat begonnen: ein erster vertikaler
Durchstich (`Quote`-Entität, durch alle vier Architekturschichten) liegt im Repo, siehe [
`GETTING_STARTED.md`](GETTING_STARTED.md). Für die Übergabe des restlichen Bauplans an einen Coding-Agenten liegt
zusätzlich [`CLAUDE_CODE_BRIEF.md`](CLAUDE_CODE_BRIEF.md) bereit.

## Dokumentation

| Dokument                                 | Beschreibung                                                                    |
|------------------------------------------|---------------------------------------------------------------------------------|
| [Lastenheft](docs/Lastenheft.docx)       | Anforderungen aus Sicht des Spielleiters (Auftraggeber), das "Was"              |
| [Pflichtenheft](docs/Pflichtenheft.docx) | Technische Umsetzungsplanung, das "Wie"                                         |
| [ERD](docs/ERD.png)                      | Datenmodell im Überblick ([.drawio-Quelldatei](docs/ERD.drawio) zum Bearbeiten) |
| [Mockups](docs/mockups/)                 | Interaktive HTML-Mockups aller Screens, direkt im Browser öffnen                |
| [Wiki](../../wiki)                       | Architektur-Entscheidungen, Feature-Übersicht, Entscheidungs-Log                |

Für alles, was über "welches Dokument sagt was" hinausgeht, lohnt sich ein Blick ins [Wiki](../../wiki), gerade das
Entscheidungs-Log hält fest, warum bestimmte Dinge so gebaut sind und nicht anders.

## Grobe Seitenstruktur

```
/login                    Discord-Login
/                          Dashboard
/board                     Live-Session (Panels: Initiative, Würfel, Karten, Shop, Timer, Notizen, ...)
/characters                Charakter-Übersicht
/character/:id             Charakterbogen
/notes                     Private Notizen
/manage                    Verwaltung (nur DM)
  /manage/maps
  /manage/monsters
  /manage/shops
  /manage/books
  /manage/quotes
  /manage/sessions
  /manage/settings
```

## Lokale Entwicklung

```bash
docker compose up
```

Details folgen, sobald das Backend-Grundgerüst steht.

## Sprachkonvention

Dokumentation (dieses README, Lastenheft, Pflichtenheft, Wiki) auf Deutsch, vorerst — Übersetzung ins Englische steht
noch aus. Das Tool selbst (Code und sichtbare UI-Texte) ist komplett Englisch.