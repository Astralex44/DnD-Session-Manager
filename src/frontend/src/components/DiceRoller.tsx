import { useState } from 'react';

const DICE = [4, 6, 8, 10, 12, 20];

interface Roll {
  expr: string;
  result: number;
}

// Always private, per FA-06 — never sent to the backend, just local state.
// History capped at 5 entries per the spec's own Nicht-Ziele.
export function DiceRoller() {
  const [die, setDie] = useState(20);
  const [count, setCount] = useState(1);
  const [mod, setMod] = useState(0);
  const [history, setHistory] = useState<Roll[]>([]);

  function roll() {
    let total = 0;
    for (let i = 0; i < count; i++) total += 1 + Math.floor(Math.random() * die);
    total += mod;
    const modLabel = mod !== 0 ? (mod > 0 ? `+${mod}` : `${mod}`) : '';
    const expr = `${count}d${die}${modLabel}`;
    setHistory((h) => [{ expr, result: total }, ...h].slice(0, 5));
  }

  const modLabel = mod !== 0 ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : '';

  return (
    <div>
      <p className="dice-private-note"><span className="lock">🔒</span> only visible to you</p>
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
      <button className="roll-btn" onClick={roll}>Roll {count}d{die}{modLabel}</button>
      {history.length > 0 && (
        <div className="roll-history">
          {history.map((r, i) => (
            <div key={i}>{r.expr} → <strong>{r.result}</strong></div>
          ))}
        </div>
      )}
    </div>
  );
}
