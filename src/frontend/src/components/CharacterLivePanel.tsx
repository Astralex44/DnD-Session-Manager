import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomSelect } from './CustomSelect.tsx';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { ABILITY_SHORT, fmtMod, modifier, toUpdateCharacterInput } from '../lib/dnd.ts';
import { onGameEvent } from '../lib/realtime.ts';
import { useCharactersStore } from '../store/charactersStore.ts';
import { useCurrencyStore } from '../store/currencyStore.ts';
import { useToastStore } from '../store/toastStore.ts';
import type { CharacterCurrency } from '../types/currency.ts';

const DEMO_GAME_ID = '00000000-0000-0000-0000-000000000001';
const EMPTY_WALLET: CharacterCurrency[] = [];
const FALLBACK_POLL_MS = 20000;

// The player's own condensed live view — HP is genuinely "live" (edited
// during combat) so that's the one thing made fully interactive here.
// Everything else (inventory, spells, features, PDF export) stays on the
// real character sheet rather than being re-implemented a second time —
// the "Open Full Sheet" link covers that.
export function CharacterLivePanel() {
  const { characters, current, fetchCharacters, fetchCharacter, updateCharacter } = useCharactersStore();
  const { denominations, wallets, fetchDenominations, fetchWallet } = useCurrencyStore();
  const showToast = useToastStore((s) => s.showToast);

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [hpCurrent, setHpCurrent] = useState(0);

  useLiveFetch(DEMO_GAME_ID, 'characters', fetchCharacters);

  useEffect(() => {
    fetchDenominations(DEMO_GAME_ID);
  }, [fetchDenominations]);

  useEffect(() => {
    if (!characterId && characters.length > 0) setCharacterId(characters[0].id);
  }, [characters, characterId]);

  // Own effect (not useLiveFetch) since it needs the currently-picked
  // characterId, not just the fixed gameId — e.g. the DM editing this
  // character's HP from the Roster, or a shop purchase debiting the wallet,
  // should refresh this panel even though neither happened here.
  useEffect(() => {
    if (!characterId) return;
    const refetch = () => {
      fetchCharacter(DEMO_GAME_ID, characterId);
      fetchWallet(DEMO_GAME_ID, characterId);
    };
    refetch();
    const unsubCharacters = onGameEvent(DEMO_GAME_ID, 'characters', refetch);
    const unsubShops = onGameEvent(DEMO_GAME_ID, 'shops', refetch);
    const interval = setInterval(refetch, FALLBACK_POLL_MS);
    return () => {
      unsubCharacters();
      unsubShops();
      clearInterval(interval);
    };
  }, [characterId, fetchCharacter, fetchWallet]);

  useEffect(() => {
    setHpCurrent(current?.hpCurrent ?? 0);
  }, [current]);

  const options = characters.map((c) => ({ value: c.id, label: `${c.name} (${c.playerName})` }));
  const wallet = characterId ? (wallets[characterId] ?? EMPTY_WALLET) : EMPTY_WALLET;

  async function handleHpBlur() {
    if (!current || hpCurrent === current.hpCurrent) return;
    const ok = await updateCharacter(DEMO_GAME_ID, current.id, { ...toUpdateCharacterInput(current), hpCurrent });
    showToast(ok ? 'Saved.' : 'Failed to save.', ok ? 'success' : 'error');
  }

  if (!current) {
    return (
      <div className="panel span-2">
        <div className="panel-header"><h3>Character</h3></div>
        <div className="panel-body"><p className="hint" style={{ margin: 0 }}>No characters yet.</p></div>
      </div>
    );
  }

  const hpMax = current.activeLevelSheet?.hpMax ?? 0;
  const hpPercent = hpMax > 0 ? Math.max(0, Math.min(100, (hpCurrent / hpMax) * 100)) : 0;
  const abilities: [string, number][] = [
    ['Strength', current.strength], ['Dexterity', current.dexterity], ['Constitution', current.constitution],
    ['Intelligence', current.intelligence], ['Wisdom', current.wisdom], ['Charisma', current.charisma],
  ];

  return (
    <div className="panel span-2">
      <div className="panel-header">
        <h3>{current.name}</h3>
        <span className="tag">Level {current.activeLevelSheet?.level ?? '—'} {current.class}</span>
      </div>
      <div className="panel-body">
        {options.length > 1 && (
          <div className="char-switch">
            <div className="field">
              <label>Character</label>
              <CustomSelect value={characterId ?? ''} onChange={setCharacterId} options={options} />
            </div>
          </div>
        )}

        <div className="board-hp-row">
          <div>
            <div className="monster-name">Hit Points</div>
            <div className="hp-bar-track"><div className={`hp-bar-fill${hpPercent < 25 ? ' low' : ''}`} style={{ width: `${hpPercent}%` }} /></div>
          </div>
          <div className="hp-control">
            <NumberInput className="hp-input" value={hpCurrent} onChange={setHpCurrent} onBlur={handleHpBlur} />
            <span className="hp-sep">/</span>
            <span className="hp-input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{hpMax}</span>
          </div>
        </div>

        <div className="sheet-grid">
          {abilities.map(([full, score]) => (
            <div key={full} className="ability">
              <div className="ab-label">{ABILITY_SHORT[full]}</div>
              <div className="ab-score">{fmtMod(modifier(score))}</div>
            </div>
          ))}
        </div>

        {denominations.length > 0 && (
          <div className="currency-badge">
            {denominations.map((d) => (
              <span key={d.id}>{wallet.find((w) => w.denominationId === d.id)?.quantity ?? 0} {d.abbreviation}</span>
            ))}
          </div>
        )}

        <Link className="add-btn" style={{ marginTop: 14, display: 'block', textAlign: 'center', textDecoration: 'none' }} to={`/character/${current.id}`}>
          Open Full Sheet
        </Link>
      </div>
    </div>
  );
}
