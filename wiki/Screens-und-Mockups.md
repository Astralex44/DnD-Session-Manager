# Screens und Mockups

Alle Mockups sind eigenständige HTML-Dateien unter `docs/mockups/`, direkt im Browser öffnen,
keine Installation nötig. Kein Figma, bewusst so gebaut wegen Plan-Limits, siehe [[Entscheidungs-Log]].

Jedes Dropdown in jedem Mockup ist eine selbst gestylte Komponente (`.custom-select`), kein
natives `<select>` — das ist der verbindliche Standard fürs echte Frontend, siehe die
Board-Mockup-CSS für das Referenzmuster.

| Screen                         | Datei                                           | Was zeigt es                                                                                                                                                                              |
|--------------------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Login (Release 1)              | `login.html`                                    | Discord-Login, Zugriffsliste-Hinweis, Einladungs-Willkommensnachricht, Benutzername-Schritt beim ersten Login                                                                             |
| Login (Multi-User-Vorschau)    | `login-multiuser-preview.html`                  | **Nicht Release 1** — Google-Login, Konto-Verknüpfung, Sign-up-Tab (Pflichtenheft 8.11)                                                                                                   |
| Board — DM-Ansicht             | `board.html`                                    | Live-Session: Charaktere (mit "Ansehen"-Button pro Zeile), Initiative, Würfel, Monsterstats, Timer, Karten (Freigabe-Popover pro Charakter), Notizen, Shops (Liste + Link zur Shop-Seite) |
| Board — Spieler-Ansicht        | `board.html` (über "Ansehen"-Button erreichbar) | Charakterbogen-Zusammenfassung (HP, Attribute, Inventar, Fähigkeiten, Zauber), eigene Würfel, Karten mit Ein-/Ausblenden/Sperren, "Zurück zur DM-Ansicht"-Button im Header                |
| Shop                           | `shop.html`                                     | Volle Shop-Ansicht. Einzelkauf ist der entschiedene, produktive Modus; der Warenkorb-Umschalter bleibt im Mockup als Vergleichsmöglichkeit sichtbar                                       |
| Kartenansicht                  | `map-viewer.html`                               | Zoom & Pan für einzelne Karten                                                                                                                                                            |
| Verwaltung                     | `manage.html`                                   | Alle 7 Tabs: Karten, Monster, Shops, Bücher, Zitate, Sessions, Einstellungen (inkl. Drag-&-Drop-Währungseditor mit Farbwähler)                                                            |
| Charakter-Erstellung           | `character-create.html`                         | Sieben-Schritte-Assistent: Grunddaten, Attribute, Fertigkeiten & Rettungswürfe, Ausrüstung, Fähigkeiten, Magie (inkl. Homebrew-Zauber mit Beschreibung), Persönlichkeit                   |
| Charakter-Übersicht            | `character-overview.html`                       | Liste aller eigenen Charaktere mit Status (Aktiv/Inaktiv/Gestorben), "Als aktiv setzen", "+ Neuer Charakter"                                                                              |
| Charakterbogen (voll)          | `character-sheet.html`                          | Vollständiger, bearbeitbarer Bogen inkl. Level-Sheet-Dropdown (mehrere Stufen-Snapshots pro Charakter, "+ Neues Level hinzufügen")                                                        |
| Charakterbogen (Export-Design) | `character-sheet-sample.pdf`                    | Wie der PDF-Export später aussehen könnte, 3 Seiten                                                                                                                                       |

Ein Teil der Mockups existiert zusätzlich als vollständige englische Version (Dateiname mit
`_EN`-Suffix bzw. Englisch im Namen) — Board, Shop, Kartenansicht, Verwaltung und
Charakter-Erstellung sind bereits übersetzt, der Rest folgt.

## Noch offen

- Vollständige Englisch-Übersetzung der restlichen Mockups (Charakter-Übersicht, Charakterbogen, beide Login-Varianten)
- Spiel-Erstellung: bewusst erst mit der Multi-User-Ausbaustufe (Pflichtenheft 8.11)

## Farbpalette

Alle Mockups nutzen dieselbe Palette (Amber/Pergament, "alter Karten- und Leder-Look"):

| Rolle                       | Hex       |
|-----------------------------|-----------|
| Hintergrund (Leinen)        | `#F1EDE2` |
| Oberfläche                  | `#E6DFCC` |
| Primär (Dull Amber)         | `#927355` |
| Text (Tinte)                | `#1D1A10` |
| Sekundärakzent (Waldgrün)   | `#4A5A42` |
| Tertiärakzent (Messing)     | `#B08D4C` |
| Fehler/zu teuer (Ziegelrot) | `#8C4A35` |