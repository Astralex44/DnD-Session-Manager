import { useCallback, useEffect, useState } from 'react';
import { accessApi } from '../api/access.ts';
import { ApiError } from '../api/client.ts';
import { charactersApi } from '../api/characters.ts';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { CustomSelect } from '../components/CustomSelect.tsx';
import { useGameId } from '../store/authStore.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { GameAccessList, GameMember } from '../types/auth.ts';

const UNASSIGNED = '';

// DM only (routed behind DmOnly). The game's access list (NFA-05): who's in,
// who's invited, and which account each character belongs to. Invites match
// the unique Discord username at login; the invite is used up once that
// person logs in for the first time.
export function PlayersPage() {
  const gameId = useGameId();
  const showToast = useToastStore((s) => s.showToast);
  const { characters, fetchCharacters } = useCharactersStore();

  const [access, setAccess] = useState<GameAccessList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState('');
  const [removeTarget, setRemoveTarget] = useState<GameMember | null>(null);

  const loadAccess = useCallback(
    () =>
      accessApi.get(gameId).then(
        (list) => { setAccess(list); setError(null); },
        (err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load the player list.'),
      ),
    [gameId],
  );

  useEffect(() => {
    void loadAccess();
    fetchCharacters(gameId);
  }, [gameId, loadAccess, fetchCharacters]);

  async function handleInvite() {
    const trimmed = handle.trim();
    if (!trimmed) return;
    try {
      await accessApi.invite(gameId, trimmed);
      setHandle('');
      showToast(`Invited @${trimmed.replace(/^@/, '').toLowerCase()}.`, 'success');
      await loadAccess();
    } catch (err) {
      const conflict = err instanceof ApiError && err.status === 409;
      showToast(conflict ? 'Already invited, or already a player in this game.' : 'Failed to invite.', 'error');
    }
  }

  async function handleRemoveInvite(inviteId: string) {
    await accessApi.removeInvite(gameId, inviteId);
    await loadAccess();
  }

  async function handleRemoveMember() {
    if (!removeTarget) return;
    await accessApi.removeMember(gameId, removeTarget.id);
    setRemoveTarget(null);
    await loadAccess();
  }

  async function handleAssign(characterId: string, userId: string) {
    try {
      await charactersApi.setOwner(gameId, characterId, userId || null);
      showToast('Saved.', 'success');
      await fetchCharacters(gameId);
    } catch {
      showToast('Failed to assign.', 'error');
    }
  }

  const members = access?.members ?? [];
  const ownerOptions = [
    { value: UNASSIGNED, label: 'Unassigned' },
    ...members.map((m) => ({ value: m.userId, label: `${m.username} (@${m.discordHandle})` })),
  ];

  return (
    <div className="players-page">
      <h2>Players</h2>
      <p className="hint">
        Only people on this list can log in. Invite someone by their Discord <strong>username</strong> (the
        unique one, not their display name) — they get in the first time they log in with Discord.
      </p>

      {error && <div className="error-banner">{error}</div>}

      <div className="sheet-section box">
        <h3 className="section-title">Invite a player</h3>
        <div className="add-row">
          <input
            placeholder="Discord username"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
          />
          <button onClick={handleInvite}>Invite</button>
        </div>
        {access && access.invites.length > 0 && (
          <>
            <p className="subhead">Invited, not logged in yet</p>
            {access.invites.map((invite) => (
              <div key={invite.id} className="list-row">
                <span className="row-name">@{invite.discordHandle}</span>
                <button className="row-remove" title="Withdraw invite" onClick={() => handleRemoveInvite(invite.id)}>✕</button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="sheet-section box">
        <h3 className="section-title">In this game</h3>
        {members.map((member) => (
          <div key={member.id} className="member-row">
            {member.avatarUrl ? <img className="user-avatar" src={member.avatarUrl} alt="" /> : <span className="user-avatar placeholder" />}
            <span className="row-name">{member.username}</span>
            <span className="member-handle">@{member.discordHandle}</span>
            {member.role === 'Dm' && <span className="role-badge">DM</span>}
            {member.role === 'Player' && (
              <button className="row-remove" title="Remove from the game" onClick={() => setRemoveTarget(member)}>✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="sheet-section box">
        <h3 className="section-title">Characters</h3>
        <p className="hint" style={{ marginTop: -4 }}>
          A character belongs to one account — only its owner can edit it. Characters from before login
          existed start unassigned. Assigning one also hands its owner the old notes saved under the
          character's player name, and files the old notes saved under the character's own name into your
          notebook on that character.
        </p>
        {characters.map((c) => (
          <div key={c.id} className="assign-row">
            <span className="row-name">{c.name}</span>
            <span className="member-handle">{c.playerName ? `Player field: ${c.playerName}` : ''}</span>
            <div className="assign-select">
              <CustomSelect
                value={c.ownerUserId ?? UNASSIGNED}
                onChange={(userId) => handleAssign(c.id, userId)}
                options={ownerOptions}
              />
            </div>
          </div>
        ))}
        {characters.length === 0 && <p className="hint">No characters yet.</p>}
      </div>

      {removeTarget && (
        <ConfirmDialog
          title="Remove this player?"
          message={`${removeTarget.username} won't be able to log in any more. Their characters and notes stay, and you can invite them again later.`}
          confirmLabel="Remove Player"
          onConfirm={handleRemoveMember}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
