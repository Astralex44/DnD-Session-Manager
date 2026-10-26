import { useEffect, useState } from 'react';
import { accessApi } from '../api/access.ts';
import { CustomSelect } from './CustomSelect.tsx';
import { NumberInput } from './NumberInput.tsx';
import { useLiveFetch } from '../hooks/useLiveFetch.ts';
import { useGameId, useIsDm } from '../store/authStore.ts';
import { useDiceStore } from '../store/diceStore.ts';
import { useToastStore } from '../store/toastStore.ts';

const DICE = [4, 6, 8, 10, 12, 20];
const ME = '';

interface DiceRollerProps {
  // "View as player" mode (DM): only the physical-roll entry, filed into this
  // player's history. Their history itself stays private — never shown here.
  enterFor?: { userId: string; name: string };
}

// FA-06: always private — each person sees only their own last 5 rolls, the
// DM included. Rolls happen on the server so the history follows you across
// devices. NFA-03 (hybrid play): a real-dice result can be typed in instead,
// and the DM can type one in for a player.
export function DiceRoller({ enterFor }: DiceRollerProps) {
  const gameId = useGameId();
  const isDm = useIsDm();
  const { history, fetchHistory, roll, recordPhysical, clearHistory, removeRoll } = useDiceStore();
  const showToast = useToastStore((t) => t.showToast);
  const [die, setDie] = useState(20);
  const [count, setCount] = useState(1);
  const [mod, setMod] = useState(0);
  const [physicalTotal, setPhysicalTotal] = useState(10);
  const [forUserId, setForUserId] = useState(ME);
  const [players, setPlayers] = useState<{ value: string; label: string }[]>([]);

  useLiveFetch(gameId, 'dice', fetchHistory);

  // The DM's own roller can file a physical roll for any player.
  useEffect(() => {
    if (!isDm || enterFor) return;
    accessApi.get(gameId).then(
      (list) => setPlayers(list.members.filter((m) => m.role === 'Player').map((m) => ({ value: m.userId, label: m.username }))),
      () => {},
    );
  }, [gameId, isDm, enterFor]);

  async function handleRoll() {
    try {
      await roll(gameId, die, count, mod);
    } catch {
      showToast('Roll failed.', 'error');
    }
  }

  async function handlePhysical() {
    const target = enterFor?.userId ?? (forUserId || null);
    const ok = await recordPhysical(gameId, expression, physicalTotal, target);
    if (ok) {
      if (target) showToast(`Recorded for ${enterFor?.name ?? players.find((p) => p.value === target)?.label}.`, 'success');
    } else {
      showToast('Failed to record the roll.', 'error');
    }
  }

  // One dice selection for both: rolling in the app, and recording a roll
  // made with real dice — so a real roll reads like any other ("5d12+3 → 35").
  const expression = `${count}d${die}${mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : ''}`;
  const modLabel = mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : '';

  const diceControls = (
    <>
      <div className="die-row">
        {DICE.map((d) => (
          <div key={d} className={`die${d === die ? ' selected' : ''}`} onClick={() => setDie(d)}>d{d}</div>
        ))}
      </div>
      <div className="dice-config">
        <div className="field-group">
          <label>Count</label>
          <div className="qty-stepper">
            <button onClick={() => setCount((c) => Math.max(1, c - 1))}>−</button>
            <span className="qty-val">{count}</span>
            <button onClick={() => setCount((c) => Math.min(20, c + 1))}>+</button>
          </div>
        </div>
        <div className="field-group">
          <label>Modifier</label>
          <div className="mod-stepper">
            <button onClick={() => setMod((m) => m - 1)}>−</button>
            <span className="mod-val">{mod >= 0 ? `+${mod}` : mod}</span>
            <button onClick={() => setMod((m) => m + 1)}>+</button>
          </div>
        </div>
      </div>
    </>
  );

  const physicalForm = (
    <div className="physical-roll">
      <p className="subhead" style={{ marginTop: 0 }}>
        {enterFor ? `Real dice ${enterFor.name} rolled — set the dice above, then the total` : 'Rolled real dice? Set the dice above, then enter the total'}
      </p>
      <div className="physical-roll-row">
        <span className="physical-expr">{expression} →</span>
        <NumberInput value={physicalTotal} onChange={setPhysicalTotal} onKeyDown={(e) => e.key === 'Enter' && handlePhysical()} />
      </div>
      {isDm && !enterFor && players.length > 0 && (
        <div className="field" style={{ marginTop: 6 }}>
          <CustomSelect value={forUserId} onChange={setForUserId} options={[{ value: ME, label: 'For: me' }, ...players.map((p) => ({ ...p, label: `For: ${p.label}` }))]} />
        </div>
      )}
      <button className="add-btn" style={{ marginTop: 6 }} onClick={handlePhysical}>+ Record {expression} → {physicalTotal}</button>
    </div>
  );

  if (enterFor) {
    return (
      <div>
        <p className="dice-private-note"><span className="lock">🔒</span> {enterFor.name}'s own rolls stay private</p>
        {diceControls}
        {physicalForm}
      </div>
    );
  }

  return (
    <div>
      <p className="dice-private-note"><span className="lock">🔒</span> only visible to you</p>
      {diceControls}
      <button className="roll-btn" onClick={handleRoll}>Roll {count}d{die}{modLabel}</button>
      {physicalForm}
      {/* History last: roll or record above, results collect at the bottom. */}
      {history.length > 0 && (
        <div className="roll-history">
          <div className="roll-history-head">
            <span>Your last rolls</span>
            <button className="row-remove" onClick={() => void clearHistory(gameId)}>Clear all</button>
          </div>
          {history.map((r) => (
            <div key={r.id} className="roll-history-row" title={r.dice ? `Dice: ${r.dice}` : undefined}>
              <span>
                {r.expression} → <strong>{r.total}</strong>
                {r.isPhysical && <span className="roll-tag">{r.enteredByOther ? 'entered by DM' : 'real dice'}</span>}
              </span>
              <button className="row-remove" title="Remove this roll" onClick={() => void removeRoll(gameId, r.id)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
