// Where the API sends a Discord login that worked but isn't on the DM's
// access list. Nothing was stored about the person, so there's nothing to
// log out of — just a way to try a different Discord account.
export function NotInvitedPage() {
  return (
    <div className="auth-page">
      <div className="auth-card box">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
        </div>
        <h2>You're not invited yet</h2>
        <p>
          This game is invite-only. Ask your DM to invite your <strong>Discord username</strong> (the
          one with no spaces, not your display name), then log in again.
        </p>
        <p className="hint">
          Logged into the wrong Discord account? Switch accounts in Discord first — logging in again
          uses whichever account Discord currently has active.
        </p>
        <a className="auth-button" href="/login">Back to login</a>
      </div>
    </div>
  );
}
