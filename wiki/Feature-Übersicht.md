# Feature-Übersicht

Kompakte Liste aller Anforderungen aus dem Pflichtenheft. Für die vollen Beschreibungen, Sicht-DM/Sicht-Spieler-Details und technische Hinweise: [Pflichtenheft](../blob/main/docs/Pflichtenheft.docx), Kapitel 4–5.

## Funktionale Anforderungen

| ID | Feature | Priorität |
|---|---|---|
| FA-01 | Karten (pro Raum, gezielte Freigabe) | Muss |
| FA-02 | Charakterbögen (volle 5e-Vorlage) | Muss |
| FA-03 | Monsterstats (Vorlage + Live-HP) | Muss |
| FA-04 | Initiative-Tracker | Muss |
| FA-05 | Regelwerk-Bibliothek | Soll |
| FA-06 | Würfelroller (immer privat) | Muss |
| FA-07 | Rechner | Kann |
| FA-08 | Notizen (privat, pro Person) | Muss |
| FA-10 | Zitate & Sessiontitel | Soll |
| FA-11 | Shop-Inventar | Muss |
| FA-12 | Timer (mehrere parallel) | Soll |
| FA-13 | Session-Notizen | Muss |
| FA-14 | Währungs-Einstellungen | Muss |
| FA-15 | Freigabe-Benachrichtigungen | Muss |

(FA-09, Abstimmungen, wurde ersatzlos gestrichen.)

## Nicht-funktionale Anforderungen

| ID | Thema |
|---|---|
| NFA-01 | Live-Synchronisation (Echtzeit-Updates ohne Reload) |
| NFA-02 | Geräteflexibilität (DM Laptop, Spieler frei) |
| NFA-03 | Hybrid-Modus (physisch + digital gemischt spielbar) |
| NFA-04 | Schnelle Ansichtswechsel (DM ↔ Spieler) |
| NFA-05 | Zugriff & Login (Discord OAuth, Zugriffsliste) |

## Bewusste Abgrenzungen (Nicht-Ziele)

- Kein d100-Würfel
- Keine Freigabe-Logik für Monsterstats (nie an Spieler gezeigt)
- Kein Spielerregelwerk im Tool (Spieler googeln selbst)
- Initiative ohne HP/Status (läuft über private Notizen)
- Kein gemeinsamer Notizbereich
- Rechner ohne DnD-spezifische Funktionen
- Wurfverlauf auf 5 Einträge begrenzt
- Kein Ersatz für Discord als Kommunikationskanal
- Nur eine Charakterbogen-Vorlage (Standard-5e) für Release 1
