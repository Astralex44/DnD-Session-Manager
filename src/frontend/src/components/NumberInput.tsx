import { useEffect, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

// A plain controlled `<input type="number" value={n}>` can never be fully
// cleared while typing: the moment the field goes empty, `Number('')` is 0,
// so React immediately redraws it back to "0" and the next keystroke lands
// next to that stray zero (typing "10" becomes "010"). This keeps its own
// text buffer so the field can sit empty mid-edit, and only re-syncs from
// `value` when it changed for a reason other than our own onChange call
// (e.g. the form was reset from freshly fetched data).
export function NumberInput({ value, onChange, onBlur, ...rest }: NumberInputProps) {
  const [text, setText] = useState(String(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      setText(String(value));
      lastEmitted.current = value;
    }
  }, [value]);

  return (
    <input
      type="number"
      {...rest}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === '' || raw === '-') return;
        const parsed = Number(raw);
        if (Number.isNaN(parsed)) return;
        lastEmitted.current = parsed;
        onChange(parsed);
      }}
      onBlur={(e) => {
        if (e.target.value === '' || e.target.value === '-') {
          setText('0');
          lastEmitted.current = 0;
          onChange(0);
        }
        onBlur?.(e);
      }}
    />
  );
}
