import { useEffect, useRef, useState } from 'react';

const PRESET_COLORS = ['#B7C0AE', '#B08D4C', '#C9B278', '#9C978A', '#A9673E', '#8C4A35', '#4A5A42', '#6B5D4A'];

interface ColorSwatchPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// Matches docs/mockups/DnD_Tool_Manage_Mockup.html's color-swatch + color-popover
// pattern: a circular swatch button opens a popover with preset dots plus a
// native color input for anything outside the presets.
export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="color-swatch-wrap" ref={rootRef}>
      <span className="color-swatch" style={{ background: value }} onClick={() => setOpen((o) => !o)} />
      {open && (
        <div className="color-popover show">
          <div className="popover-label">Suggestions</div>
          <div className="preset-swatches">
            {PRESET_COLORS.map((color) => (
              <div key={color} className="swatch-row" onClick={() => { onChange(color); setOpen(false); }}>
                <span className="dot" style={{ background: color }} />
                <span className="hex">{color}</span>
              </div>
            ))}
          </div>
          <div className="popover-label">Custom Color</div>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
      )}
    </div>
  );
}
