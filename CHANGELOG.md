# Changelog

User-facing changes, newest first. Internal work (refactors, tooling, groundwork nobody can see yet) is left out.

## [Unreleased]

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
