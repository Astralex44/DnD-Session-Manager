# Changelog

User-facing changes, newest first. Internal work (refactors, tooling, groundwork nobody can see yet) is left out.

## v0.11.0-alpha — 2026-10-26

### Added
- **Timers for chosen characters:** when starting a timer, the DM picks *Everyone* or one or more characters. Players
  only see the timers meant for them; the DM sees all of them, each marked with who it's for.
- **Shop purchases go into the inventory:** whatever is bought (by a player or through the DM's Sell) lands in the
  buyer's inventory with its category, weight and description. Buying more of an item you already have adds to its
  count.
- **Shop categories:** every shop item has a category from a fixed list (Armor and shields, Weapons, Adventuring
  gear, Tools, Spellcasting focus, Gemstones, Poisons, Miscellaneous). Shops show their items grouped by it. Existing
  items start as Miscellaneous.
- **Weight on shop items**, shown in the shop.
- **Shop locations:** a shop can have a location (e.g. "Waterdeep, Dock Ward"), set when creating or editing it, with
  suggestions from locations already used. Manage → Shops can be searched by name or location and filtered by
  location; on the Board the DM's shop picker groups shops by location and has a location filter. Players see the
  location under the shop's name.
- **Inventory view:** "View inventory" on the sheet opens your items as cards — more per row the wider the window.
  Click a card to edit it, "+ New item" to add one. The sheet itself lists the items read-only, with weight and a
  total weight.
- **Clearing dice rolls:** ✕ removes one roll from your history, "Clear all" empties it.

### Changed
- **Bigger uploads:** maps, books and monster stat blocks can be up to 100 MB (was about 28 MB). A file that's too
  large now says so right away.
- Item weight and description show on the sheet, in the creation wizard and in the PDF export.

### Fixed
- Dropdown menus inside Board panels (e.g. the shop) were cut off at the panel's edge and awkward to scroll. They now
  float above everything.
- "All my characters" on the sheet was missing for players with just one character, leaving no way back to the
  character list.

## v0.10.1-alpha — 2026-10-19

### Changed
- **Lighter Board:** panel headers are no longer solid dark brown — just a brown title with a brass line under it;
  the brown is kept for the buttons.

## v0.10.0-alpha — 2026-10-19

### Added
- **Board ⇄ character sheet in one click:** "Sheet ›" in the Board's character panel opens that character's sheet;
  "‹ Board" at the top of the sheet goes straight back.
- **"Characters" in a player's sidebar opens their active character directly.** No active character → the list, to
  pick or create one. On the sheet, "All my characters" (when you have more than one) leads back to the list.

### Changed
- **One active character per player:** setting a character active (or creating a new one) makes your other active
  characters inactive.
- **Real-dice rolls use the dice selection:** pick the dice as for a normal roll, enter the total, and it's recorded
  as e.g. "5d12+3 → 35". The roll history now sits at the bottom of the dice panel.

## v0.9.0-alpha — 2026-10-19

### Added
- **Previews of shared files:** maps and documents on the Board show a small preview — PDFs show their first page.
- **Quotes can be filtered by session** as well as by who said them.
- **Monster stat blocks open from Manage → Monsters** (Open), not only from the Board.

### Changed
- The player Board uses the full width of the screen.
- Session notes get much more room — a large field in Manage → Sessions, and full width on the Board.
- Adding and editing monsters and sessions happens right on the page, like shops and documents, instead of in a pop-up.
- "Set all items to…" (sale mode for a whole shop) moved into the shop's edit form and asks before it changes anything.
- The sale-mode explanations are shown inside the dropdown instead of under it.

### Fixed
- Text fields grow with what you type everywhere (shop and item descriptions, the character creation wizard, spell
  descriptions, quotes) instead of hiding text behind a scrollbar.
- A newly opened create form no longer sits right against the list below it.
- Deleting a currency that shop items still use now says which items (shop → item) instead of failing with a long
  error; deleting one that's only in characters' purses warns how many coins are lost first.

## v0.8.0-alpha — 2026-10-19

### Changed
- **Manage is part of the main sidebar (DM):** instead of switching to a separate area with its own header, "Manage"
  opens a group in the normal sidebar with Documents, Monsters, Shops, Quotes, Sessions, Players and Settings.
  The Board is always one click away, and the group stays open until you close it.

## v0.7.1-alpha — 2026-10-19

### Changed
- **Log out** moved into a menu behind your name and avatar (top right) instead of sitting out in the open.

## v0.7.0-alpha — 2026-10-19

### Changed
- **The DM's view of a player's character is completely read-only** — no Level Up, no level switching, no edits to
  ability scores, HP maximum or spell slots, and no HP changes from the Board. Bringing a replacement character up
  to the group after a death is now the player's job. (Before, the DM could adjust those for replacement characters.)

## v0.6.2-alpha — 2026-10-19

### Fixed
- A login error message (e.g. "Discord login isn't set up") no longer sticks around after the problem is gone —
  it's shown once and then cleared from the address.

## v0.6.1-alpha — 2026-10-19

### Fixed
- The browser tab now shows a d20 icon in the app's colours and the title "DnD Session Manager" (it said
  "frontend" with a generic logo).

## v0.6.0-alpha — 2026-10-17

### Added
- **Buy in the shop yourself:** shops shared with you now have a **Buy** button. Items you can't afford (in exactly
  the listed coins) show red and can't be bought; sold-out items disappear from your view. The DM still sees them,
  greyed out and struck through.
- **Sale mode for a whole shop (DM):** "All items…" in Manage → Shops sets shared stock or per-player for every item
  at once.
- **End session (DM):** one button on the Board's Maps panel hides every shared map for the players again —
  except the ones a player locked. Nothing is unshared; players can unhide a map themselves.
- **Hand a map on:** pass a map you hold to another character at the table (↪ on the map), like handing over the
  paper copy.

### Fixed
- Opening or reloading the Board no longer pops up maps and shops that were shared long ago as if they were new.

## v0.5.0-alpha — 2026-10-17

### Added
- **Real dice count too:** rolled physical dice? Type the result into the dice panel and it joins your history
  (marked "real dice").
- **The DM can enter a roll for a player** (e.g. someone rolling at the table without a device) — it lands in that
  player's own history, marked "entered by DM".
- **View as player (DM):** "View as" next to each character on the Board switches to exactly what that player
  sees, to enter things on their behalf; "Back to DM view" returns. Their notes and dice history stay private
  even then.

### Changed
- Your dice history (last 5 rolls) is now kept with your account — it survives a reload and follows you to
  another device. Still private: nobody else, the DM included, can see your rolls.

### Fixed
- Finished timers now show "done" instead of sitting at 00:00.

## v0.4.0-alpha — 2026-10-17

### Added
- **Session notes on the Board (DM):** the prep notes for the session you're about to play (the next one by date,
  switchable) sit right on the Board and can be edited there.
- **My Notes on the Board** for everyone — your private notebook, compact, without leaving the table.
- **Players see the timers** running on the Board (only the DM starts and stops them).
- **Calculator** on the Board — plain four functions.

## v0.3.0-alpha — 2026-10-16

### Added
- **Everything is switched on.** The **Dashboard** (characters, latest session, recent quotes) is the home page again, and
  the live **Board** is open to everyone: the DM sees the full cockpit (characters, initiative, dice, timer,
  monsters, shops, maps), players see their character, the initiative order, dice, and what's shared with them.
- **Manage (DM only):** the DM's setup area — maps and books, monsters, shops, quotes, sessions, players, and the
  currency settings. Players management moved in here from the main sidebar.

## v0.2.1-alpha — 2026-10-16

### Fixed
- After an update you could still be running the previous version of the app until you reloaded — that's what
  showed a bare "401" box instead of the login page. The app now always loads its latest version.
- When your session ends while you're using the app (logged out elsewhere, or the DM removed you), you're sent
  straight to the login page instead of seeing errors.
- The buttons on the login and "not invited yet" pages looked broken.
- A server without Discord configured now says so on the login page instead of showing an error page.

## v0.2.0-alpha — 2026-10-16

First release in the new version scheme: minor for features, patch for fixes (`v0.2.1-alpha`, `v0.3.0-alpha`, …).
Together with v0.1.0-alpha.9 below, this is the login release.

### Fixed
- Logging in with Discord on the live site. v0.1.0-alpha.9 sent Discord an `http://` return address, which
  Discord rejects, so nobody could log in.

## v0.1.0-alpha.9 — 2026-10-16

### Added
- **Log in with Discord.** The game is invite-only: the DM invites players by Discord username on the new
  **Players** page, and anyone not invited sees a "not invited yet" page instead of the app.
- **Players page (DM):** invite and remove players, and assign each character to a player's account. Characters
  from before login start unassigned until the DM assigns them; their old notes move over to the right person
  automatically.
- The DM keeps a private running notebook per player character ("Notes on …").
- Spells and cantrips have a link field (e.g. to the spell's rules page), and the description now works on every
  spell, not just homebrew ones. Both show when you click the spell name and are included in the PDF export.
- Players get notified the moment the DM shares a map or a shop with their character: a new map pops up with
  "View now" / "Later", a new shop opens straight away.

### Changed
- Characters and notes now belong to your account. You see and edit only your own characters; the DM can read
  every character but only adjust ability scores, HP maximum, level sheets and spell slots. Nobody — the DM
  included — can read anyone else's notes.
- Players only receive the maps, shops and quotes that were actually shared with them, checked on the server.

### Fixed
- Switching between notebooks on the Notes page could leave the page empty ("Select…") instead of opening the
  first page.

### Removed
- The PIN code lock on sheets and notes — your account login replaces it.

## Earlier versions

Up to and including `v0.1.0-alpha.8`: see the git tags.
