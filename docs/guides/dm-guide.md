# DnD Session Manager — DM Guide

## Getting in

You log in with Discord and are the DM automatically. **Your very first job is inviting your players** — until you do, nobody else can get in, not even to look at their own character.

1. Open [dnd.astralex.dev](https://dnd.astralex.dev) and click **Log in with Discord**. Discord asks once to share your username and avatar — nothing else.
2. You land on the **Dashboard**. Your name and a **DM** badge sit in the top right; the sidebar has **Manage**, which only you see.

### Inviting players — do this first

Go to **Manage → Players** and type a player's Discord **username** under *Invite a player* — the unique one without spaces, not their display name (an `@` in front is fine). Then tell them to log in with Discord.

- Until their first login they show under *Invited, not logged in yet*; the ✕ there withdraws the invite.
- After it they move to *In this game*. The ✕ there removes them: they can't log in any more, but their characters and notes stay, and you can invite them again.
- Anyone who isn't invited sees *You're not invited yet* instead of the app.

### Giving each character its player

A character belongs to one player's account, and only that player can edit it. Characters made before login existed start **unassigned** and are visible only to you. In **Manage → Players → Characters**, pick the player in the dropdown next to each character.

Assigning also moves old notes over automatically: notes saved under the character's player name go to that player, notes saved under the character's own name go into your notebook on that character.

## Before the first session

Invite your players first (see Getting in) — everything below can wait, that can't. After that, everything you prepare lives under **Manage**; set it up in this order, because shops need currencies and the Board draws on all of it.

1. **Currencies** (Manage → Settings). Click **+ New Currency** for each coin: name, abbreviation, colour and value. Order them from most valuable (top) to smallest (bottom) with the arrows; the bottom one is the base unit (value 1). Values are only your reference — the app never converts between coins. A coin can't be deleted while shop items still price in it; the app lists which ones.
2. **Maps and books** (Manage → Documents). Upload PNG, JPG, WEBP or PDF files with a name, one map per room rather than one big map. Books are your reference material. Upload replaces a file; sharing happens on the Board during play.
3. **Monsters** (Manage → Monsters). A monster is a template: name, its stat block as a PDF, and default HP. Live HP during a fight is tracked separately on the Board, so the template never changes.
4. **Shops** (Manage → Shops). **Create Shop** with a name and optional flavour text, then **+ Item** for each thing on sale: name, price and sale mode. A price can mix coins, e.g. 2 gold and 5 silver.
5. **Sessions** (Manage → Sessions). **+ Add Session** with a title, date and time, and your prep in *Session Notes (Prep)*. Sessions number themselves (Session 12, 13 …) and keep their number if you delete an earlier one.

Each shop item has one of two sale modes; **Set all items to…** in a shop's Edit form sets one mode for every item at once — it warns and asks before it overwrites anything.

| Sale mode | Who can buy | Quantity you set |
| --- | --- | --- |
| Shared Stock | Everyone, from one pile that runs down | Stock Quantity (empty = unlimited) |
| Per Player Limited | Each character on its own | Max Per Character |

Players only ever see what you share with their character, so preparing all of this in advance gives nothing away.

## Running a session on the Board

The **Board** is your cockpit during play: every panel updates live for everyone at the table, without reloading.

| Panel | What you do there |
| --- | --- |
| Characters | Each character's HP at a glance. **View as** shows the Board exactly as that player sees it; **Sheet** opens their sheet (read-only for you). |
| Initiative | Type a name and value, tick *Monster* if it is one, **+ Entry** (or press Enter, then type the next name straight away). **Next Turn** moves the marker, **Clear** ends the fight. Players see the order live. |
| Dice | Pick a die, count and modifier, then roll — only you see your rolls. Rolled real dice? Keep the same dice selection, type the total and record it (shown as e.g. 5d12+3 → 35) — for yourself, or *For: ‹player›* to file it in that player's history. Results collect at the bottom of the panel. |
| Timer | Label, length in seconds, **+ Start Timer** — for spells, effects and rituals. Players see them count down; finished ones show *done* until you remove them with ✕. |
| Monsters | Pick a template or *Custom monster*, set Max HP, **+ Monster**. Add the same template several times for several goblins; change each one's HP as it takes damage. **Clear Encounter** after the fight. Players never see this panel. |
| Shop | Pick a shop. *Share with…* opens it for chosen characters — it pops open on their screen at once. **Sell** sells for a player at the table: choose the buyer and quantity, and change the price if you haggled. |
| Maps | Click a map and tick who sees it under *Visible to*; every map shows a small preview (PDFs their first page), and those players get a *View now / Later* pop-up. **End session** hides every shared map again, except maps a player locked. |
| Session Notes | Your prep for the next session by date (switchable), across the full width of the Board and editable right here. |
| My Notes | Your private notebook, compact; **All pages ›** opens the Notes page. |
| Calculator | The four basic operations, for quick sums. |

**View as** is for hybrid play: with a player's view open you can buy for them, toggle their maps or record a real-dice roll they made, and **Back to DM view** returns. Their notes, dice history and sheet stay private and read-only even then.

## Characters, notes and quotes

You can read every character but edit none of them; your own writing lives in your notebooks and the quote list.

- **Characters** lists every player's characters with their owner, and *unassigned* on any you still need to give a player. A sheet opens read-only for you, with a note saying whose it is — levelling up, HP and everything else is the player's job, even for a replacement character after a death.
- **Notes** holds your private notebooks. *My notes* is your own; *Notes on ‹character›* is a running notebook per player character, not tied to any session. Each notebook has as many pages as you like; pages save with the **Save** button, not automatically.
- **Quotes** (Manage → Quotes) collects memorable lines: **+ Add Quote**, link it to a session and to the character whose player said it. A new quote starts hidden; its *Hidden* button switches it to *Shared*, and back; shared quotes appear on everyone's Dashboard. Filter the list by who said it and by session.
- **Session titles** you set in Manage → Sessions are visible to players; your prep notes in the same place are not.

## Rules the tool follows

These are built in and checked on the server, so they hold no matter what anyone clicks.

- **Notes are private.** Only the person who wrote them can read them — you can't read players' notes, and they can't read yours.
- **Dice are private.** Everyone sees only their own last 5 rolls. A real-dice roll you record for a player lands in their history; you can't look at it afterwards.
- **Players see only what's theirs or shared.** Their own characters; maps and shops shared with one of their characters; shared quotes; session titles; initiative and timers. Never monsters, your prep notes, or other players' sheets and notes.
- **Sharing is per character, never automatic.** A new character starts with nothing shared, even if the same player had maps before — share again deliberately.
- **Coins never convert.** A price must be paid in exactly the coins listed; enough value in other coins doesn't count. When you sell at the table you can change the price for that one sale.
- **Ability modifiers below 10 are your house rule:** each point below 10 is −1 (9 = −1, 8 = −2, 7 = −3). From 10 up it's standard 5e. The sheet marks this so it doesn't look like a mistake.
- **Level-up HP** adds the hit-die roll plus the Constitution modifier plus the proficiency bonus (your group's rule).
- **Replacement characters start from zero:** at most starter gear, no shared maps or shop access. The player brings level and abilities in line with the group.

## Quick answers

Most hiccups at the table come down to an invite, an assignment, or a share to the wrong character.

| Problem | What to do |
| --- | --- |
| A player sees *You're not invited yet* | Check Manage → Players: their exact Discord username, not the display name. Removed players need a new invite. |
| A player is in but sees no character | Assign it in Manage → Players → Characters. |
| A player can't find a shared map | Check you shared it with *that* character. They may have hidden it themselves: *Show hidden maps* at the bottom of their Maps panel. |
| A shop item shows red for a player | Their character lacks the exact coins listed. The player adds coins on their sheet, or you **Sell** it with an adjusted price. |
| You forgot to hide maps after a session | Press **End session** whenever — it only hides, nothing is unshared. |
| A player wants to undo a level-up or fix their sheet | Only they can edit it; the Danger Zone at the bottom of their sheet deletes the current level. |
| A page looks out of date | Reload it. The app always loads its newest version, and nothing is lost. |
| You need to hand the DM role to someone else | The DM is set on the server — ask Severin. |
| Something is actually broken | Tell Severin what you clicked and what you expected. |
