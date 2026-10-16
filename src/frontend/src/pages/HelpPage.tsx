// Short how-to for players. The full guides (DM and player) are separate
// documents; keep this page to the essentials of each area.
export function HelpPage() {
  return (
    <div className="help-page">
      <h2>Help</h2>
      <p className="hint">
        The essentials of each area. Everything saves to your account, so it's the same on every device.
      </p>

      <div className="help-grid">
        <div className="sheet-section box">
          <h3 className="section-title">Logging in</h3>
          <p>
            You log in with <strong>Discord</strong>. The game is invite-only: the DM adds your
            Discord <strong>username</strong> (the unique one without spaces, not your display
            name) on their Players page, and you're in from your first login on.
          </p>
          <p>
            Your characters and notes belong to your account. Nobody else can edit your
            character, and nobody, the DM included, can read your notes.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Finding your character</h3>
          <p>
            Go to <strong>Characters</strong> in the sidebar — you see your own characters there.
            A character from before login existed shows up once the DM has assigned it to your
            account. If you don't have one yet, click{' '}
            <strong>+ Create New Character</strong> and fill in the wizard — race, class, ability
            scores, starting HP, and so on.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Editing your sheet</h3>
          <p>
            There's no Save button — every field saves automatically the moment you click or tab
            away from it, but only if you actually changed something. A small message appears in
            the bottom-right corner confirming the save (green) or telling you it failed (red).
          </p>
          <p>
            If a save fails, your change is still sitting in the field — fix whatever's wrong and
            click away again to retry.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Leveling up</h3>
          <p>
            Click <strong>+ Level Up</strong> at the top of your sheet. You only enter the new
            level and your hit dice roll for this level — the app adds your Constitution modifier
            and proficiency bonus itself:
          </p>
          <p style={{ fontFamily: 'var(--font-data)' }}>
            new HP = current HP + Constitution modifier + proficiency bonus + hit dice roll
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Coin purse</h3>
          <p>
            Your currency lives as separate pills (e.g. gold, silver) under the Basics section —
            edit the number in any pill directly, same autosave-on-blur behavior as the rest of
            the sheet.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">PDF export</h3>
          <p>
            <strong>Download PDF</strong> at the top of your sheet generates a print-ready
            character sheet with your current stats — handy to have offline or on your phone
            during the session.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Private notes</h3>
          <p>
            <strong>Notes</strong> in the sidebar is your own private notebook — nobody else at
            the table sees it, not even the DM. Create as many titled pages as you like; unlike
            your sheet, pages here use an explicit <strong>Save</strong> button.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">The Board</h3>
          <p>
            <strong>Board</strong> is the live table during a session: your character at a glance, the
            initiative order, dice, timers, and the maps and shops the DM has shared with you. It updates
            on its own — no reloading. When the DM shares a map you get a pop-up (<strong>View now</strong>{' '}
            or <strong>Later</strong>); a shared shop opens straight away.
          </p>
        </div>

        <div className="sheet-section box">
          <h3 className="section-title">Something broken?</h3>
          <p>Tell the DM directly rather than trying to fix it mid-session.</p>
        </div>
      </div>
    </div>
  );
}
