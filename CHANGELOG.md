# Changelog

User-facing changes, newest first. Internal work (refactors, tooling, groundwork nobody can see yet) is left out.

## [Unreleased]

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
