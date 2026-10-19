# Screens and Mockups

The mockups are self-contained HTML files in [`docs/mockups/`](../docs/mockups/): open them in a browser, nothing to
install. No Figma, on purpose (see the [Decision Log](Decision-Log.md)). They show the **planned** screens; the app
departs from them where building it showed a better way (for example, Manage is a group in the main sidebar rather
than its own area, and monsters and sessions are edited inline). The live app is the reference for how it looks now.

| Screen                          | File                                                       | What it shows                                                                                                                                               |
|---------------------------------|------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Login (release 1)               | `DnD_Tool_Login_Mockup.html`                               | Discord login, access-list hint, invite welcome, username step on first login                                                                               |
| Login (multi-user preview)      | `DnD_Tool_Login_MultiUser_Preview.html`                    | **Not release 1** — Google login, account linking, sign-up tab (Pflichtenheft 8.11)                                                                          |
| Board, DM and player view       | `DnD_Tool_Board_Mockup.html`, `…_EN.html`                  | Live session: characters (with "View as" per row), initiative, dice, monsters, timers, maps (share popover per character), notes, shops; the player view with its own dice and map hide/lock |
| Shop                            | `DnD_Tool_Shop_Mockup.html`, `…_EN.html`                   | Full shop view. Single purchase is the chosen mode; the cart toggle stays in the mockup for comparison                                                       |
| Map viewer                      | `DnD_Tool_Kartenansicht_Mockup.html`, `…_EN.html`          | Zoom and pan for one map                                                                                                                                     |
| Manage                          | `DnD_Tool_Manage_Mockup.html`, `…_EN.html`                 | All seven tabs: maps, monsters, shops, books, quotes, sessions, settings (including the currency editor with colour picker)                                  |
| Character creation              | `DnD_Tool_CharacterCreate_Mockup.html`, `…_EN.html`        | Step-by-step wizard: basics, abilities, skills and saves, equipment, features, magic (including homebrew spells), personality                               |
| Character overview              | `DnD_Tool_CharacterOverview_Mockup.html`                   | All your characters with status (active/inactive/dead), "Set Active", "+ New Character"                                                                      |
| Character sheet                 | `DnD_Tool_CharacterSheet_Mockup.html`                      | The full editable sheet, with the level-sheet dropdown ("+ Add new level")                                                                                   |
| Character sheet (export design) | `DnD_Tool_Charakterbogen_Rhogar.pdf`                       | How the PDF export could look, 3 pages                                                                                                                       |

Files without `_EN` are the original German versions. The character overview, character sheet and both login
mockups exist only in German; they don't need translating any more, since the built screens replaced them.

## Colour palette

Amber and parchment, an "old map and leather" look. The same values are the CSS variables in
`src/frontend/src/index.css`.

| Role                          | Hex       |
|-------------------------------|-----------|
| Background (linen)            | `#F1EDE2` |
| Surface                       | `#E6DFCC` |
| Primary (dull amber)          | `#927355` |
| Text (ink)                    | `#1D1A10` |
| Secondary accent (forest)     | `#4A5A42` |
| Tertiary accent (brass)       | `#B08D4C` |
| Error / too expensive (brick) | `#8C4A35` |
