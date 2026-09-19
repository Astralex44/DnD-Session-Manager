# Datenmodell

Übersicht über das [ERD](../blob/main/docs/ERD.drawio) (30 Entitäten). Für Details immer die `.drawio`-Datei öffnen,
hier nur die Landkarte dazu.

## Die wichtigsten Cluster

| Cluster           | Kernentität                                                     | Bemerkung                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|-------------------|-----------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Account & Spiel   | `USER`, `GAME`, `GAME_MEMBER`                                   | Rolle (DM/Spieler) hängt am `GAME_MEMBER`, nicht am `USER` — dieselbe Person kann in einem Spiel DM, im nächsten Spieler sein                                                                                                                                                                                                                                                                                                                                                                                                              |
| Charakter         | `CHARACTER` + `CHARACTER_LEVEL_SHEET` + 6 weitere Kind-Tabellen | `CHARACTER` hält alles, was sich nicht pro Level ändert (Persönlichkeit, Inventar, Fertigkeits-Übungen). `CHARACTER_LEVEL_SHEET` hält die Werte, die sich pro Stufe ändern können (Level, HP-Maximum, Übungsbonus, die sechs Attribute) — ein Charakter kann mehrere gleichzeitig haben (aktuell gespielt + vorbereitet), `CHARACTER.active_level_sheet_id` zeigt auf die gerade angezeigte. Zauber (`CHARACTER_SPELLCASTING`/`CHARACTER_SPELL`/`CHARACTER_SPELL_SLOT`) hängen konsequenterweise am Level-Sheet, nicht am Charakter direkt |
| Monster           | `MONSTER`, `SESSION_MONSTER`                                    | Vorlage vs. Live-Kampfteilnehmer, siehe [[Entscheidungs-Log]]                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Karten            | `MAP`, `MAP_SHARE`                                              | Eine Karte pro Raum, Freigabe pro Charakter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Shop              | `SHOP`, `SHOP_ITEM`, `SHOP_SHARE`, `PURCHASE`                   | Zwei Verkaufsmodi (geteilter Vorrat / pro Spieler einmalig) über ein Feld auf `SHOP_ITEM`. Einzelkauf ist der entschiedene UI-Modus                                                                                                                                                                                                                                                                                                                                                                                                        |
| Währung           | `CURRENCY_DENOMINATION`, `GAME_COLOR_SWATCH`                    | Vollständig konfigurierbar pro Spiel, nicht auf D&D-Standardmünzen beschränkt                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Session-Werkzeuge | `SESSION`, `INITIATIVE_ENTRY`, `TIMER`, `DICE_ROLL`             | Alle an eine `SESSION` gebunden                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## Wiederkehrendes Muster: Freigabe-Logik

Karten- und Shop-Freigabe funktionieren nach demselben Prinzip: eine Verknüpfungstabelle zwischen dem Inhalt (`MAP`/
`SHOP`) und dem `CHARACTER`, der Zugriff hat. Kein Inhalt ist automatisch für alle sichtbar, auch nicht, wenn alle
Charaktere einzeln freigegeben wurden — das ist bewusst ein manueller Schritt des DM, nie ein impliziter
Standardzustand.

## Wieso an CHARACTER statt an USER?

Fast alles Spielrelevante hängt am `CHARACTER`, nicht am `USER`-Account: Inventar, Werte, Guthaben, Kartenfreigaben,
Käufe. Grund: ein Spieler kann mehrere Charaktere haben (verschiedene Kampagnen, oder ein Ersatzcharakter nach dem Tod
des alten), und die sollen sich nichts teilen. Das war ursprünglich nicht überall korrekt umgesetzt, siehe den
entsprechenden Eintrag im [[Entscheidungs-Log]].

## Multi-Game-Grundlage

`GAME` und `GAME_MEMBER` existieren schon, obwohl Release 1 nur eine einzige Kampagne braucht. `game_id` ist bereits auf
allen kampagnenspezifischen Tabellen (Sessions, Charaktere, Karten, Shops, Zitate, Notizen, Währungen). Grund: eine
Oberfläche für mehrere Kampagnen ist als spätere Ausbaustufe geplant, das Schema soll dann nicht mehr migriert werden
müssen.

## Homebrew-Zauber

`CHARACTER_SPELL` hat `is_homebrew` (bool) und `description` (text, optional). Bei selbst erfundenen Zaubern lässt sich
nirgends nachschlagen was sie tun, deshalb bekommen sie eine eigene Beschreibung, die im Charakterbogen beim Anklicken
des Namens angezeigt wird. Offizielle Zauber brauchen das nicht.