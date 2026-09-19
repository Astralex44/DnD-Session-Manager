# DnD Session Manager — Wiki

Diese Wiki ergänzt [Lastenheft](../blob/main/docs/Lastenheft.docx)
und [Pflichtenheft](../blob/main/docs/Pflichtenheft.docx) um schnell durchsuchbare Hintergrundinformationen. Die beiden
Word-Dokumente bleiben die verbindliche Quelle für Anforderungen und technische Spezifikation, hier geht's eher um
Überblick, Navigation und das "warum".

## Seiten

- [[Architektur]] — Backend-Stack, Deployment, Frontend-Struktur, Seitenbaum
- [[Datenmodell]] — Überblick über das ERD, die wichtigsten Design-Entscheidungen
- [[Feature-Übersicht]] — Alle FA-/NFA-Anforderungen kompakt auf einen Blick
- [[Screens und Mockups]] — Welcher Screen macht was, wo liegt das passende Mockup
- [[Entscheidungs-Log]] — Chronologisch, warum etwas so entschieden wurde und nicht anders
- [[Setup]] — Lokale Entwicklungsumgebung aufsetzen

## Wo finde ich was?

| Frage                                 | Antwort                                                                 |
|---------------------------------------|-------------------------------------------------------------------------|
| Was soll das Tool können?             | [Lastenheft](../blob/main/docs/Lastenheft.docx)                         |
| Wie wird's technisch umgesetzt?       | [Pflichtenheft](../blob/main/docs/Pflichtenheft.docx) + [[Architektur]] |
| Wie sieht ein bestimmter Screen aus?  | [[Screens und Mockups]]                                                 |
| Warum ist X so und nicht anders?      | [[Entscheidungs-Log]]                                                   |
| Wie bekomme ich das lokal zum Laufen? | [[Setup]]                                                               |

## Projektstand

Planung abgeschlossen (Lastenheft + Pflichtenheft final, alle Screens gemockt, Datenmodell steht, keine offenen
Design-Entscheidungen mehr). Umsetzung hat begonnen: ein erster vertikaler Durchstich (Quote-Entität, komplett durch
alle Schichten) existiert im Repo, siehe `GETTING_STARTED.md`. Für die Übergabe an einen Coding-Agenten gibt's
zusätzlich `CLAUDE_CODE_BRIEF.md` mit der kompletten Zusammenfassung von Architektur, Datenmodell und Business-Regeln an
einem Ort.