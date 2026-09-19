// Alpha-scoped on purpose — only Characters + Notes are in real use right
// now (see project_realtime_sync_state / board-initiative-dice-timer-state
// memory: Board and everything live is a separate, later rollout). Expand
// this page card-by-card as each new area actually goes live, rather than
// documenting features nobody can use yet.
export function HelpPage() {
  return (
    <div className="help-page">
      <h2>Help</h2>
      <p className="hint">
        This is an early alpha test — tonight, character sheets and private notes are the only
        things in real use. Everything below covers that.
      </p>

      <div className="help-grid">
        <div className="sheet-section box">
          <h3 className="section-title">Finding your character</h3>
          <p>
            Go to <strong>Characters</strong> in the sidebar. If you don't have one yet, click{' '}
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
          <h3 className="section-title">Known limitations tonight</h3>
          <ul>
            <li>No login yet — anyone with the link can open or edit any character. Please only edit your own.</li>
            <li>Board, live initiative, shop, and maps aren't part of tonight's test.</li>
            <li>Something looks broken? Tell the DM directly rather than trying to fix it mid-session.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
