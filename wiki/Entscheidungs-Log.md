# Entscheidungs-Log

Die wichtigsten Design- und Architekturentscheidungen, chronologisch, mit kurzer Begründung. Reine "Was steht wo"-Fragen
gehören ins Lastenheft/Pflichtenheft, hier geht's ums "Warum".

## Karten: ein PDF pro Raum statt Ausschnitt-Freigabe

Ursprünglich war eine "Fog of War"-artige Freigabe innerhalb einer grossen Karte geplant. Der DM lädt in der Praxis aber
ohnehin eine Karte pro Raum hoch. Dadurch reicht eine einfache Sichtbarkeits-Zuordnung zwischen ganzer Karte und
Charakter, deutlich weniger Aufwand als Bereichs-Logik innerhalb einer Karte.

## Karten- und Shop-Freigabe: nie automatisch für alle

Ein Freigabe-Klick betrifft immer einzelne, ausgewählte Charaktere. "Für alle" ist nur das Ergebnis eines expliziten
Klicks auf alle Checkboxen, nie ein impliziter Standardzustand.

## Würfel: immer privat, auch bei Spielern

Zwischenzeitlich war angedacht, dass Spieler-Würfe für alle öffentlich sichtbar sind und nur DM-Würfe privat bleiben.
Endgültige Antwort: alle Würfe sind immer nur für die werfende Person selbst sichtbar, unabhängig von der Rolle.
Begründung: so viel Vertrauen haben DMs in ihre Spieler.

## Monster: Vorlage getrennt von Live-Kampfteilnehmer

`MONSTER` ist eine reine Vorlage (Name, PDF, Standard-HP), gehört dem DM, spielübergreifend. `SESSION_MONSTER` ist die
Live-Kopie mit eigenem `hp_current`/`hp_max`, gebunden an eine Session. Ausgelöst durch ein Detail beim Bauen des
Verwaltungs-Mockups: die Verwaltungsseite sollte nur die Vorlage bearbeiten können, das Board nur den Live-Zustand. Ohne
die Trennung liesse sich beides nicht sauber auseinanderhalten, und mehrere gleichzeitige Instanzen derselben Vorlage in
einem Kampf (z. B. drei Goblins) wären nicht unabhängig verwaltbar gewesen.

## Charakterbezogene statt account-bezogene Freigaben (Korrektur)

Kartenfreigabe, Shop-Freigabe und Käufe hingen ursprünglich an `user_id`. Beim Diskutieren des Charakter-Umschalters (
ein Spieler kann mehrere Charaktere haben) fiel auf: das hätte bedeutet, ein neuer Ersatzcharakter hätte automatisch
dieselben Kartenfreigaben wie der alte Charakter gehabt, einfach weil es derselbe Account ist. Korrigiert auf
`character_id`. Ein neuer Charakter startet dadurch konsequent bei null, das ist so gewollt (siehe unten).

## Ersatzcharakter nach Tod: bewusst kein automatischer Übertrag

Bestätigt vom Auftraggeber: neues Inventar (höchstens Starterausrüstung), Kartenfreigaben und Shop-Zugänge bei null.
Bewusst als Konsequenz fürs Sterben gedacht. Einzige Ausnahme: Level und Attribute werden vom DM manuell an die
restliche Gruppe angeglichen, damit ein Ersatzcharakter nicht weit zurückliegt, das bleibt aber ein manueller Schritt,
keine automatische Berechnung.

## Shop: geteilter Vorrat vs. pro Spieler einmalig

Zwei Verkaufsmodi pro Artikel: ein gemeinsamer Bestand über alle Spieler (inkl. Teilmengen-Käufe), oder "an alle
verkaufbar" (jeder Spieler kann unabhängig von den anderen kaufen, bis zu einer festgelegten Menge pro Spieler). Kein
gemeinsamer Zähler bei Letzterem nötig: das System prüft nur, ob für die Kombination aus Artikel und Charakter schon
genug gekauft wurde.

## Shop-Käufe durch den DM: Dropdown statt freier Bestandsbearbeitung

Ursprünglich sollte der DM den Vorrat eines Artikels während einer Session frei bearbeiten können. Stattdessen: der DM
öffnet ein Kauf-Modal und wählt per Dropdown, für welchen Charakter er den Kauf tätigt. Läuft dann als ganz normaler
Kauf (Vorrat sinkt, Guthaben wird abgezogen), kein Sonderfall nötig. Vereinfacht die Umsetzung spürbar.

## Währungen: vollständig konfigurierbar statt fixer D&D-Münzen

Nicht nur der Wert, auch Name, Kürzel und Farbe jeder Münzart sind pro Spiel frei einstellbar. Reihenfolge per Drag &
Drop, die unterste Münzart ist automatisch die Basis-Einheit (Wert = 1). Eigene Farben aus dem Farbwähler werden pro
Spiel gespeichert und als Vorschläge wiederverwendet.

## Kein BaaS, volles Self-Hosting

Ursprünglich war Supabase (Cloud oder self-hosted) im Gespräch. Endgültige Entscheidung: eine komplett selbst
programmierte Lösung ohne Backend-as-a-Service, weder Cloud noch self-hosted BaaS. Volle Kontrolle, keine Abhängigkeit
von einem Drittanbieter-Produkt.

## Kein Figma

Figma-Nutzung ist an Plan-Limits gescheitert. Stattdessen eigenständige, interaktive HTML-Mockups mit Vanilla JS, laufen
offline im Browser, keine Abhängigkeit von einem Drittanbieter-Tool oder dessen Nutzungslimits.

## Multi-Game- und Multi-User-Grundlage schon in Release 1

`GAME`, `GAME_MEMBER` und ein eindeutiges, mandatory `username`-Feld auf `USER` sind schon jetzt im Schema, obwohl
Release 1 nur eine Kampagne und nur Discord-Login braucht. Begründung: diese Felder nachträglich einzuführen, sobald es
bereits echte Nutzerdaten gibt, ist deutlich aufwendiger als sie von Anfang an mitzuplanen. Die dazugehörige
Oberfläche (mehrere Spiele verwalten, Google-Login, Konto-Verknüpfung, Einladungslinks) ist explizit **nicht** Teil von
Release 1.

## Frontend-Wechsel: React statt Vue

Ursprünglich war Vue 3 + Pinia geplant. Beim Aufsetzen des eigentlichen Techstacks nochmal bewusst aufgemacht und auf
React + Zustand gewechselt. Hauptgrund: das grössere Ökosystem und die grössere Community von React, gerade relevant für
ein Projekt das später vielleicht kommerziell wird oder wo mal jemand dazustösst. Vue wäre technisch genauso gut
gewesen, kein Qualitätsproblem, reine Ökosystem-Abwägung.

## Level-Sheets statt einem einzigen Charakterbogen pro Charakter

Charaktere ändern sich über die Stufen stark (HP, Attribute, Zauber, Fähigkeiten), und der DM wollte für die erste
Session bereits einen vorbereiteten Bogen für die nächste Stufe haben. Zwei Optionen standen im Raum: pro Level ein
komplett eigener, unabhängiger Charakterbogen, oder mehrere "Level-Sheets" innerhalb desselben Charakters. Entschieden:
Letzteres. `CHARACTER_LEVEL_SHEET` hält nur das, was sich wirklich pro Stufe ändert (Level, HP-Maximum, Übungsbonus,
Attribute, Zauber), alles andere (Inventar, Persönlichkeit, die meisten Fertigkeiten) bleibt am Charakter selbst und
wird nicht dupliziert. Umschaltbar per Dropdown sowohl im Charakterbogen als auch direkt im Live-Board.

## Fähigkeiten-Mechanik: nur Anzeige, kein Verbrauch

Zur Debatte stand, ob das Tool sich merken soll, wie oft eine Fähigkeit mit begrenzter Nutzung (z. B. "1× pro kurzer
Rast") in der laufenden Session schon eingesetzt wurde. Vom DM entschieden: nein, reine Anzeige-Liste zum Nachschlagen,
wie ein Nachschlagewerk. Kein Verbrauchs-/Cooldown-Tracking, keine Rast-Funktion im Tool. Hätte sonst ein eigenes
kleines Feature mit eigenem Datenmodell und einer neuen "Rast"-Aktion gebraucht.

## Homebrew-Zauber brauchen eine eigene Beschreibung

Ein selbst erfundener Zauber lässt sich in keinem Regelwerk nachschlagen. `CHARACTER_SPELL` bekam deshalb
`is_homebrew` (bool) und ein optionales `description`-Feld: bei Hausregel-Zaubern wird der Name im Charakterbogen
klickbar und zeigt die Beschreibung, bei offiziellen Zaubern nicht nötig.

## Keine nativen Dropdowns mehr

Native `<select>`-Elemente sehen je nach Betriebssystem/Browser unterschiedlich aus und passen nicht ins
Amber/Pergament-Design. Ab einem bestimmten Punkt der Mockup-Arbeit wurde das zum verbindlichen Standard erklärt: jedes
Dropdown im ganzen Tool ist eine eigene, selbst gestylte Komponente (Trigger-Button + Popover-Menü), rückwirkend auf
alle bestehenden Mockups nachgezogen.