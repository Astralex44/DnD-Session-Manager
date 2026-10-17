import { useState } from 'react';

type Op = '+' | '−' | '×' | '÷';

function apply(a: number, op: Op, b: number): number {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
  }
}

// Rounds away float noise (0.1 + 0.2) without hiding real decimals.
function show(n: number): string {
  if (!Number.isFinite(n)) return 'Error';
  return String(Math.round(n * 1e10) / 1e10);
}

// FA-07: a plain four-function calculator, nothing D&D-specific (deliberate
// non-goal). Runs entirely in the browser; nothing is stored or shared.
export function CalculatorPanel() {
  const [entry, setEntry] = useState('0');
  const [acc, setAcc] = useState<number | null>(null);
  const [op, setOp] = useState<Op | null>(null);
  const [fresh, setFresh] = useState(true); // next digit starts a new number

  function digit(d: string) {
    if (fresh || entry === '0' || entry === 'Error') {
      if (entry === 'Error') { setAcc(null); setOp(null); }
      setEntry(d === '.' ? '0.' : d);
      setFresh(false);
    } else if (!(d === '.' && entry.includes('.'))) {
      setEntry(entry + d);
    }
  }

  function operator(next: Op) {
    const value = Number(entry);
    const result = acc !== null && op && !fresh ? apply(acc, op, value) : acc ?? value;
    setAcc(result);
    setEntry(show(result));
    setOp(next);
    setFresh(true);
  }

  function equals() {
    if (acc === null || !op) return;
    const result = apply(acc, op, Number(entry));
    setEntry(show(result));
    setAcc(null);
    setOp(null);
    setFresh(true);
  }

  function clear() {
    setEntry('0');
    setAcc(null);
    setOp(null);
    setFresh(true);
  }

  function backspace() {
    if (fresh) return;
    setEntry(entry.length > 1 ? entry.slice(0, -1) : '0');
  }

  const keys: [string, () => void, string?][] = [
    ['C', clear, 'calc-fn'], ['⌫', backspace, 'calc-fn'], ['÷', () => operator('÷'), 'calc-op'], ['×', () => operator('×'), 'calc-op'],
    ['7', () => digit('7')], ['8', () => digit('8')], ['9', () => digit('9')], ['−', () => operator('−'), 'calc-op'],
    ['4', () => digit('4')], ['5', () => digit('5')], ['6', () => digit('6')], ['+', () => operator('+'), 'calc-op'],
    ['1', () => digit('1')], ['2', () => digit('2')], ['3', () => digit('3')], ['=', equals, 'calc-eq'],
    ['0', () => digit('0'), 'calc-zero'], ['.', () => digit('.')],
  ];

  return (
    <div className="panel">
      <div className="panel-header"><h3>Calculator</h3></div>
      <div className="panel-body">
        <div className="calc-display" aria-live="polite">
          <span className="calc-pending">{acc !== null && op ? `${show(acc)} ${op}` : ''}</span>
          <span className="calc-entry">{entry}</span>
        </div>
        <div className="calc-keys">
          {keys.map(([label, onPress, cls]) => (
            <button key={label} type="button" className={`calc-key ${cls ?? ''}`} onClick={onPress}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
