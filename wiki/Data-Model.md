# Data Model

The map of the data model as built (`src/backend/DndSessionManager.Api/Entities`). The original design is the
[ERD](../docs/DnD_Tool_ERD_New_Version.drawio) — open the `.drawio` file for the planned detail. Where the code
differs from it, this page says so.

## Clusters

| Cluster         | Entities                                                                                                                   | Notes                                                                                                                                                                                                                                                                                       |
|-----------------|----------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Account & game  | `User`, `Game`, `GameMember`, `GameInvite`                                                                                 | The role (DM/player) sits on `GameMember`, not on `User` — the same person can be DM in one game and a player in the next. `GameInvite` holds a Discord username the DM invited; it becomes a `GameMember` on first login.                                                                   |
| Character       | `Character`, `CharacterLevelSheet`, `CharacterSkill`, `CharacterSave`, `CharacterAttack`, `CharacterItem`, `CharacterCurrency` | `Character` holds everything that doesn't change per level, including the six ability scores and `OwnerUserId` (the only account allowed to edit it). `CharacterLevelSheet` holds what does: level, max HP, proficiency bonus. `ActiveLevelSheetId` points at the one shown.                |
| Spells          | `CharacterSpellcasting`, `CharacterSpell`, `CharacterSpellSlot`                                                            | Hang on the level sheet, not the character, because spells change with level.                                                                                                                                                                                                              |
| Documents       | `Document` (`Type`: `Map` or `Book`), `DocumentShare`                                                                      | Maps and books share one table. A share links a document to a character, with the player's own `Hidden` and `Locked` flags. Only maps are shared (the UI offers no sharing for books, which stay the DM's reference).                                                                                                                                        |
| Monsters        | `Monster`, `SessionMonster`                                                                                                | Template vs. live combatant, see the [Decision Log](Decision-Log.md).                                                                                                                                                                                                                      |
| Shop            | `Shop`, `ShopItem`, `ShopItemPrice`, `ShopShare`, `Purchase`                                                               | `ShopItem.SaleMode` is `SharedStock` or `PerPlayerLimited`. A price can mix several coins (one `ShopItemPrice` row per coin).                                                                                                                                                              |
| Currency        | `CurrencyDenomination`                                                                                                     | Fully configurable per game. (The ERD's `GAME_COLOR_SWATCH` wasn't built.)                                                                                                                                                                                                                 |
| Board tools     | `InitiativeEntry`, `InitiativeState`, `GameTimer`, `DiceRoll`                                                              | Hang on the **game**, not on a session (the ERD tied them to `SESSION`): the Board is one live table, and a fight doesn't care which planned session it falls in.                                                                                                                           |
| Sessions, notes | `Session`, `Note`, `Quote`                                                                                                 | `Session` has a number that never changes, a title, a date and the DM's prep notes. `Note` belongs to one account (`OwnerUserId`), optionally about a character. `Quote` can point at a session and at the character who said it.                                                         |

`DataProtectionKey` holds ASP.NET's cookie-encryption keys, so logins survive a redeploy.

## Recurring pattern: sharing

Map and shop sharing work the same way: a link table between the content (`Document`/`Shop`) and the `Character` that
gets access. Nothing is visible to everyone automatically, not even when every character was shared one by one —
sharing is always a deliberate step by the DM, never a default.

## Why on CHARACTER rather than USER?

Almost everything in play hangs on the `Character`, not the account: inventory, stats, coins, map shares, purchases.
A player can have several characters (a replacement after a death, say), and they must not share anything. This was
not right everywhere at first; see the [Decision Log](Decision-Log.md).

What hangs on the account is ownership (who may edit a character), notes and dice rolls — the things that belong to
the person, not the character.

## Multi-game groundwork

`Game` and `GameMember` exist although release 1 has a single campaign, and `GameId` is on every campaign table. A UI
for several campaigns is planned later, and the schema should not need migrating for it.

## Homebrew spells

`CharacterSpell` has `IsHomebrew` and an optional `Description`. An invented spell can't be looked up anywhere, so it
gets its own description, shown when you click its name on the sheet.
