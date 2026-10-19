import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/auth.ts';
import { useAuthStore } from '../store/authStore.ts';

const ERROR_MESSAGES: Record<string, string> = {
  login_failed: "The Discord login didn't go through — it was cancelled or timed out. Try again.",
  discord_not_configured: "Discord login isn't set up on this server yet (no Discord Client ID/Secret configured).",
};

// Outside the app shell: no sidebar, nothing that needs a game. Logging in is
// a full-page trip to Discord via the API, which sends the browser back to
// returnUrl afterwards (or to /not-invited when the DM hasn't invited you).
export function LoginPage() {
  const [params, setParams] = useSearchParams();
  const { status, error: loadError, load } = useAuthStore();
  const returnUrl = params.get('returnUrl') ?? '/';

  // ?error= comes from the API's redirect after a failed attempt. Read it
  // once, then drop it from the address — otherwise it sticks around and a
  // reload (or a later visit to the same URL) shows a message about an
  // attempt that's long over, e.g. "not set up" after Discord was configured.
  const [errorCode] = useState(() => params.get('error'));
  const error = ERROR_MESSAGES[errorCode ?? ''] ?? loadError;
  useEffect(() => {
    if (!params.has('error')) return;
    const next = new URLSearchParams(params);
    next.delete('error');
    setParams(next, { replace: true });
  }, [params, setParams]);

  // Someone who opens /login while still logged in goes straight on.
  useEffect(() => {
    if (status === 'loading') load();
  }, [status, load]);

  if (status === 'authenticated') return <Navigate to={returnUrl} replace />;

  return (
    <div className="auth-page">
      <div className="auth-card box">
        <div className="brand">
          <span className="glyph">⚔</span>
          <h1>DnD Session Manager</h1>
        </div>
        <p>Log in with the Discord account your DM invited.</p>
        {error && <p className="auth-error">{error}</p>}
        <a className="auth-button" href={authApi.loginUrl(returnUrl)}>Log in with Discord</a>
        {import.meta.env.DEV && <DevLogin returnUrl={returnUrl} />}
      </div>
    </div>
  );
}

// Local development only — the API's dev-login runs the same rules as the
// Discord login (configured DM ID, invites) without a Discord app.
function DevLogin({ returnUrl }: { returnUrl: string }) {
  const [discordId, setDiscordId] = useState('');
  const [handle, setHandle] = useState('');

  return (
    <details className="dev-login">
      <summary>Dev login (local only)</summary>
      <div className="field">
        <label>Discord ID</label>
        <input value={discordId} onChange={(e) => setDiscordId(e.target.value)} />
      </div>
      <div className="field">
        <label>Discord username</label>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} />
      </div>
      <a className="auth-button dev-login-go" href={authApi.devLoginUrl(discordId, handle, returnUrl)}>Log in</a>
    </details>
  );
}
