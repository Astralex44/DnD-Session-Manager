# Feature Overview

Every requirement from the Pflichtenheft, compactly. For the full descriptions, the DM and player views and technical
notes, see the [Pflichtenheft](../docs/DnD_Tool_Pflichtenheft.docx), chapters 4–5. Status as of `v0.10.0-alpha`.

## Functional requirements

| ID    | Feature                                         | Priority | Status |
|-------|-------------------------------------------------|----------|--------|
| FA-01 | Maps (one per room, shared per character)       | Must     | Built  |
| FA-02 | Character sheets (full 5e template)             | Must     | Built  |
| FA-03 | Monster stats (template plus live HP)           | Must     | Built  |
| FA-04 | Initiative tracker                              | Must     | Built  |
| FA-05 | Rulebook library (Books, DM only)               | Should   | Built  |
| FA-06 | Dice roller (always private)                    | Must     | Built  |
| FA-07 | Calculator                                      | Could    | Built  |
| FA-08 | Notes (private, per person)                     | Must     | Built  |
| FA-10 | Quotes and session titles                       | Should   | Built  |
| FA-11 | Shop inventory                                  | Must     | Built  |
| FA-12 | Timers (several at once)                        | Should   | Built  |
| FA-13 | Session notes                                   | Must     | Built  |
| FA-14 | Currency settings                               | Must     | Built  |
| FA-15 | Share notifications                             | Must     | Built  |

(FA-09, polls, was dropped without replacement.)

## Non-functional requirements

| ID     | Topic                                                         | Status |
|--------|---------------------------------------------------------------|--------|
| NFA-01 | Live sync (real-time updates without a reload)                | Built  |
| NFA-02 | Any device (DM on a laptop, players on anything)              | Built  |
| NFA-03 | Hybrid play (physical and digital mixed)                      | Built  |
| NFA-04 | Quick view switching (DM ↔ player, "View as")                 | Built  |
| NFA-05 | Access and login (Discord OAuth, invite list)                 | Built  |

## Deliberate non-goals

- No d100.
- Monster stats are never shared with players.
- No player rulebook in the tool (players look rules up themselves).
- Initiative without HP or conditions (that goes in private notes).
- No shared notes area.
- The calculator has no D&D-specific functions.
- Roll history is capped at 5 entries per person.
- Not a replacement for Discord as the place to talk.
- One character sheet template (standard 5e) for release 1.
