# Decision Log

The main design and architecture decisions, oldest first, each with a short reason. "What is specified where"
belongs in the Lastenheft/Pflichtenheft; this page is about the "why". Later entries carry their date.

## Maps: one file per room instead of revealing parts of a map

The first plan was a fog-of-war style reveal inside one big map. In practice the DM uploads one map per room anyway,
so a plain visibility link between a whole map and a character is enough — far less work than area logic inside a
map.

## Map and shop sharing: never automatically for everyone

A share always targets individual, chosen characters. "Everyone" is only ever the result of ticking every box, never
an implicit default.

## Dice: always private, players included

For a while the idea was that player rolls are public and only the DM's stay private. Final answer: every roll is
visible only to the person who rolled it, whatever their role. Reason: that's how much DMs trust their players.

## Monsters: template separate from the live combatant

`Monster` is a pure template (name, stat block PDF, default HP) owned by the DM. `SessionMonster` is the live copy with
its own current and max HP. This came out of building the Manage mockup: Manage should edit only the template, the
Board only the live state. Without the split the two couldn't be kept apart, and several instances of one template in
a fight (three goblins) couldn't be tracked independently.

## Shares per character, not per account (correction)

Map shares, shop shares and purchases first hung on `user_id`. While discussing the character switcher (a player can
have several characters) it turned out that a new replacement character would then have inherited the old one's map
shares, just because it's the same account. Corrected to `character_id`. A new character therefore starts from zero,
on purpose (next entry).

## Replacement character after a death: deliberately no carry-over

Confirmed by the DM: new inventory (starter gear at most), map shares and shop access at zero. Meant as a consequence
of dying. The player brings level and ability scores in line with the group themselves; nothing is calculated
automatically. (Originally the DM was allowed to do that for a replacement character; **dropped 2026-10-19**, see
"The DM is read-only on characters" below.)

## Shop: shared stock vs. per-player limit

Two sale modes per item: one stock shared by all players (partial purchases allowed), or sellable to everyone, where
each character can buy independently up to a set amount. The second needs no shared counter: the server only checks
whether that item and character combination has already bought enough.

## Purchases by the DM: a dropdown instead of editing stock freely

The DM was first meant to edit an item's stock freely during a session. Instead, the DM opens a sell dialog and picks
which character is buying. It then runs as a normal purchase (stock goes down, coins are taken), with no special case
— a noticeably simpler build. (Since `v0.6.0`, 2026-10-17, players can also buy for themselves.)

## Currencies: fully configurable instead of fixed D&D coins

Not only the value but also the name, abbreviation and colour of each coin are set per game. The order is set by the
DM; the bottom coin is the base unit (value 1). The values are only a reference: the app never converts between coins.

## No backend-as-a-service, fully self-hosted

Supabase (cloud or self-hosted) was discussed. Final decision: a completely self-written backend, no BaaS of any kind.
Full control, no dependency on a third-party product.

## No Figma

Figma ran into plan limits. Instead: self-contained, interactive HTML mockups in vanilla JS that run offline in a
browser, with no dependency on a third-party tool or its usage limits.

## Multi-game and multi-user groundwork already in release 1

`Game`, `GameMember` and a unique, required `Username` on `User` are in the schema although release 1 needs one
campaign and Discord login only. Adding these fields once real user data exists is far more work than planning them
in. The matching UI (several games, Google login, account linking, invite links) is explicitly **not** release 1.

## Frontend: React instead of Vue

Vue 3 + Pinia was the original plan. Reopened deliberately when setting up the stack, and switched to React + Zustand.
Main reason: React's larger ecosystem and community, relevant for a project that might go commercial or get another
developer. Vue would have been just as good technically; this was purely an ecosystem call.

## Level sheets instead of one sheet per character

Characters change a lot over the levels, and the DM wanted a prepared sheet for the next level ready by the first
session. Options: a completely separate sheet per level, or several level sheets inside one character. Chosen: the
latter. `CharacterLevelSheet` holds only what really changes per level (level, max HP, proficiency bonus, spells);
everything else (inventory, personality, most skills) stays on the character and isn't duplicated. While building,
the ability scores moved from the level sheet to the character, so they can be edited any time, independent of
levelling up.

## Features: display only, no usage tracking

Should the tool track how often a limited-use feature ("once per short rest") was used this session? The DM decided
no: a plain list to look things up, like a reference book. No usage or cooldown tracking, no rest action — that would
have needed its own small feature with its own data model.

## Homebrew spells get their own description

An invented spell can't be looked up in any rulebook. `CharacterSpell` therefore has `IsHomebrew` and an optional
description: for house-rule spells the name on the sheet is clickable and shows it.

## No native dropdowns

Native `<select>` elements look different on every OS and browser and don't fit the amber/parchment design. Made the
binding standard during the mockup work: every dropdown in the tool is a custom-styled component (trigger button plus
popover), applied back to all existing mockups.

## Login: a fixed DM plus invites by Discord username (2026-10-16)

The DM is set in the server configuration (their Discord user ID), not chosen in the app, so nobody can make themselves
DM. Everyone else gets in only by invite: the DM types a player's Discord username, and the invite turns into a game
membership on that player's first login. Characters that existed before logins get assigned to their player by the
DM once.

## Dice live on the server (2026-10-17)

Rolls used to live only in the browser, so the history vanished on reload and couldn't hold the real-dice rolls the
DM enters for a player at the table. Now every roll, digital or physical, is a `DiceRoll` row on the server: the
history (last 5 per person) follows the account to any device and survives reloads. Still private — the server only
ever returns your own rolls, and a roll the DM enters for a player goes into that player's history, not the DM's.

## End session hides maps instead of a "session running" switch (2026-10-17)

The spec's idea was a live session state that would hide maps when it ends. Built instead: one **End session** button
that hides every shared map for the players again, except maps a player locked. Nothing is unshared, so the next
session starts from the same shares, and a player can unhide a map themselves. No state to forget to switch on, and
forgetting to press it costs nothing — it can be pressed any time later.

## The DM is read-only on players' characters (2026-10-19)

The DM can read every character sheet but change none: levelling up, HP and everything else is the player's job,
with no exception — including replacement characters after a death. Enforced on the server (`Owner` access on every
character write); for the DM the sheet opens read-only and Level Up is hidden. Reason: a character belongs to its
player, and an exception for the DM would undermine that.

## Manage as a group in the main sidebar (2026-10-19)

The mockups had Manage as a separate area with its own header and sidebar. Built instead: an expandable **Manage**
group in the one sidebar everyone uses. The DM switches between setup and the Board constantly during a session, and
a second shell made that a detour.

## One active character per player (2026-10-19)

Setting a character active (or creating one) makes the player's other characters inactive. That makes "your
character" unambiguous, so a player's **Characters** link goes straight to that sheet, and the Board and sheet are
one click apart.
