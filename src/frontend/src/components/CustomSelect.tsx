import { useEffect, useRef, useState } from 'react';

export interface CustomSelectOption {
  value: string;
  label: string;
  // Consecutive options sharing the same group get a section header above
  // the first one. Ungrouped options (group left unset) render plain, so
  // this is opt-in per option — existing callers are unaffected.
  group?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Standing UI convention: no native <select> anywhere, see mockups/*.html
// for the .custom-select / .cs-option pattern this replicates.
export function CustomSelect({ options, value, onChange, placeholder = 'Select…' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className={`custom-select${open ? ' open' : ''}`} ref={rootRef}>
      <button type="button" className="custom-select-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selected?.label ?? placeholder}</span>
        <span className="cs-arrow">▼</span>
      </button>
      <div className="custom-select-menu">
        {options.flatMap((option, i) => {
          const nodes = [];
          if (option.group !== undefined && option.group !== options[i - 1]?.group) {
            nodes.push(
              <div key={`group-${option.group}`} className="cs-group-label">{option.group}</div>,
            );
          }
          nodes.push(
            <div
              key={option.value}
              className={`cs-option${option.value === value ? ' selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </div>,
          );
          return nodes;
        })}
      </div>
    </div>
  );
}
