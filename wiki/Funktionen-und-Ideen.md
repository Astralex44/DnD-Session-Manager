# Funktionen und Ideen

Zwei Dinge in einem Dokument: Erstens eine ausführliche Erklärung, was das Tool aktuell tatsächlich kann und wie man
es benutzt — für dich als DM, nicht als technische Doku. Zweitens eine laufende Liste mit Ideen für mögliche
Erweiterungen, die während der Entwicklung aufgekommen sind, aber bewusst noch nicht gebaut wurden. Du entscheidest,
was davon umgesetzt wird.

Wird laufend erweitert, sobald neue Funktionen fertig sind.

---

## Aktuell fertige Funktionen

Die App ist in zwei Bereiche aufgeteilt: **Charaktere** ist reine Spieler-Sache (kein DM-Login nötig, sobald das
existiert), alles andere läuft unter **Verwaltung** (`/manage/...`) mit eigenem Kopfbereich und eigener
Seitenleiste — das ist dein Bereich als DM. Sobald Discord-Login und Rollen existieren, wird "Verwaltung" nur für
dich sichtbar sein (siehe Ideen weiter unten).

### Zitate (`/manage/quotes`)

Einfache Liste denkwürdiger Sprüche aus der Session. Text eingeben, "+ Add Quote" — fertig. Über "Shared"/"Hidden"
lässt sich pro Zitat umschalten, ob es für alle sichtbar ist oder nur intern (DM-Ansicht), "Delete" löscht es
wieder. Aktuell noch ohne Zuordnung zu einer bestimmten Session — das kommt automatisch dazu, sobald Zitate mit der
neuen Sessions-Verwaltung verknüpft werden.

### Charaktere (`/characters`)

Die grösste bisher fertige Funktion. Ein Charakter gehört komplett dem Spieler selbst — der DM muss (und soll)
normalerweise nicht eingreifen. Einzige Ausnahme: nach dem Tod eines Charakters darf der DM beim Ersatzcharakter
Level und Attribute manuell an die Gruppe angleichen, damit der neue Charakter nicht komplett von vorn anfangen
muss (siehe Entscheidungs-Log). Alles andere — Erstellung, laufende Pflege, Levelaufstieg — macht der Spieler
selbst.

**Erstellung** (`+ Create New Character`): ein 8-Schritte-Assistent — Grunddaten, Attribute, Fertigkeiten &
Rettungswürfe, Ausrüstung, Merkmale, Angriffe, Zauber (nur falls Zauberwirker), Persönlichkeit & Hintergrund. Jeder
Schritt ist einzeln über die Schrittleiste oben ansteuerbar, muss also nicht linear durchlaufen werden.

**Charakterbogen** (Klick auf eine Karte in der Übersicht): der vollständige, bearbeitbare Bogen. Attribute,
Rettungswürfe und Fertigkeiten zeigen die berechneten Boni direkt an (inkl. Ability-Score-Modifikatoren als kleines
Abzeichen). Kampfwerte (RK, Initiative, Bewegung, HP aktuell/temporär/maximal, Übungsbonus, passive Wahrnehmung —
letztere wird automatisch berechnet, siehe unten), Todesrettungswürfe, Angriffe, Ausrüstung, optional Zauber, und
Persönlichkeit/Hintergrund/Aussehen/Beziehungen/Schätze. Jede Karte hat einen eigenen "Save"-Button.

**Attribute** (STR/DEX/CON/INT/WIS/CHA): jederzeit direkt im Bogen editierbar, unabhängig vom Levelaufstieg — sie
gehören zum Charakter selbst, nicht zu einer bestimmten Stufe.

**Levelaufstieg** ("+ Level Up", oben in der Kopfzeile): erstellt ein neues "Level-Sheet" für den Charakter. Da die
Attribute jetzt losgelöst vom Level sind, geht es beim Levelaufstieg nur noch um HP: neues Level eintragen, dazu als
Referenz Trefferwürfel und der aktuelle Konstitutions-Modifikator (beides nur zur Berechnung angezeigt), den
gewürfelten Trefferwürfel-Wert plus Konstitutions-Modifikator unter "Add to HP" eintragen, Übungsbonus anpassen —
fertig. Alles andere (Inventar, Zauber, Persönlichkeit) bleibt automatisch erhalten. Über das Dropdown oben lässt
sich jederzeit zwischen den Level-Sheets eines Charakters wechseln (z. B. um vorab schon die nächste Stufe
vorzubereiten, ohne die aktuelle zu verlieren).

**Münzbeutel** (im Bogen, unter den Grunddaten): zeigt den Bestand jeder im Spiel angelegten Münzart als eigenen
Zähler, direkt editierbar. Keine automatische Umrechnung zwischen Münzarten — siehe Abschnitt "Währungen &amp; Shops".

**PDF-Export** ("Download PDF"): erzeugt ein fertig formatiertes PDF des kompletten Bogens, im gleichen
Pergament/Amber-Design wie die App — Seite 1 Kampfdaten, Seite 2 Persönlichkeit, Seite 3 Zauber (nur falls
vorhanden).

**Löschen** ("Delete Character"): fragt vorher extra nach ("Delete this character?"), da es unwiderruflich ist.

**Hausregel — Attributsmodifikatoren**: über 10 wie Standard-5e (alle 2 Punkte = +1). Unter 10 abweichend:
jeder einzelne Punkt unter 10 zählt voll (9 = −1, 8 = −2, 7 = −3, 6 = −4 …), nicht wie im Regelwerk paarweise. Wird
überall, wo ein Modifikator angezeigt wird, auch als Hinweistext sichtbar gemacht, damit es nicht wie ein Fehler
wirkt.

### Karten (`/manage/maps`)

Eine Karte pro Raum, statt eines grossen Plans mit Ausschnitten — einfacher pro Charakter freizugeben. Hochladen
(PNG/JPG/WEBP/PDF) mit Namen. Diese Seite zeigt nur den **aktuellen** Freigabestatus pro Charakter an ("Sichtbar",
"Versteckt", "Gesperrt", "nicht freigegeben") — geändert wird die Freigabe erst am Spieltisch, auf dem Live-Board,
sobald das gebaut ist. Die interaktive Kartenansicht mit Zoom/Pan folgt ebenfalls dort.

### Monster (`/manage/monsters`)

Reine Vorlagen: Name, PDF-Statblock, Standard-HP. Die tatsächliche, sich während des Kampfs ändernde HP eines
Monsters gehört nicht hierher — das läuft separat pro Kampf auf dem Live-Board, sobald das gebaut ist. Diese Seite
ist nur die Bibliothek, aus der sich das Board später bedient.

### Bücher (`/manage/books`)

Referenzmaterial (Regelwerke, eigene Notizen als PDF) nur für dich als DM — wird nie mit Charakteren geteilt, im
Gegensatz zu Karten und Shops. Hochladen, "Open" zum Anschauen.

### Sessions (`/manage/sessions`)

Titel, geplanter Termin und vorbereitete Notizen pro Session. Jede Session bekommt automatisch eine fortlaufende
Nummer ("Session 12", "Session 13", …) — die bleibt auch erhalten, wenn eine frühere Session mal gelöscht wird.
Titel ist optional (dann heisst es einfach "Session 13" ohne Zusatz).

### Währungen &amp; Shops (`/manage/settings`, `/manage/shops`)

**Währungen** (Abschnitt innerhalb Einstellungen): pro Spiel komplett frei einstellbar — Name, Kürzel, Farbe und ein
Referenzwert je Münzart, nicht auf die klassischen fünf D&amp;D-Münzen beschränkt. Reihenfolge per Pfeil-Buttons
anpassbar, Änderungen speichern automatisch. Der Referenzwert dient nur dir als Orientierung — die App rechnet
nirgendwo automatisch zwischen Münzarten um, auch nicht beim Kauf.

**Shops**: ein Shop hat einen Namen, eine Beschreibung und eine Liste von Artikeln. Ein Artikel hat einen Preis, der
aus mehreren Münzarten bestehen kann (z. B. "2 Gold und 5 Silber" als ein Preis), und einen von zwei Verkaufsmodi:
**geteilter Vorrat** (eine gemeinsame Stückzahl für alle, sinkt bei jedem Kauf) oder **pro Charakter begrenzt** (jeder
Charakter darf unabhängig bis zu einer festgelegten Menge kaufen, kein gemeinsamer Zähler). Ein Kauf muss exakt in
den angegebenen Münzarten bezahlt werden — hat ein Charakter z. B. genug Gold, aber der Preis verlangt Silber,
schlägt der Kauf fehl, auch wenn der Gold-Wert theoretisch reichen würde.

Wie bei Karten: diese Seite ist reine Einrichtung (Shop anlegen, Artikel & Preise pflegen) plus Anzeige, wem der Shop
aktuell freigegeben ist. Gekauft wird nicht hier, sondern am Spieltisch auf dem Live-Board, sobald das gebaut ist.

---

## Ideen für später (noch nicht gebaut, nur notiert)

Alles hier ist eine Idee, kein Plan. Wenn du etwas davon willst, sag Bescheid, dann wird's eingeplant.

- **Währungsumtausch beim Händler.** Aktuell muss ein Artikel exakt in der angegebenen Münzart bezahlt werden,
  keine automatische Umrechnung. Du hattest erwähnt, dass ein Händler optional auch eine andere Münzart akzeptieren
  könnte, vermutlich zu einem schlechteren Kurs — Mechanik dafür noch nicht festgelegt.
- **Bücher auch für Spieler sichtbar machen.** Aktuell sind Bücher (`/manage/books`) bewusst nur für dich als DM.
  Du hattest angedacht, dass es evtl. eine zweite Ansicht auf dem Live-Board geben könnte, über die auch Spieler
  bestimmte Bücher einsehen können (z. B. das Player's Handbook zum Nachschlagen). Noch nicht entschieden, welche
  Bücher das beträfe oder ob es pro Buch einstellbar wird — kommt frühestens mit dem Board.
