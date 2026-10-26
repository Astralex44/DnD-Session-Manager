import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface CustomSelectOption {
  value: string;
  label: string;
  // Consecutive options sharing the same group get a section header above
  // the first one. Ungrouped options (group left unset) render plain, so
  // this is opt-in per option — existing callers are unaffected.
  group?: string;
  // Optional explanation shown under the label in the open menu only
  // (the closed trigger shows just the label).
  description?: string;
}

interface CustomSelectProps {
  options: CustomSelectOption[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MENU_MAX_HEIGHT = 260;
const MENU_GAP = 5;
const VIEWPORT_EDGE = 8;

interface MenuPosition {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
}

// Standing UI convention: no native <select> anywhere, see mockups/*.html
// for the .custom-select / .cs-option pattern this replicates.
//
// The open menu is portalled to <body> with position: fixed. Rendered inside
// the select it got clipped by any ancestor with overflow (every Board
// .panel has overflow: hidden — the DM's "menu behind the card" bug,
// 2026-10-26), so now it floats above everything, follows its trigger on
// scroll/resize, and opens upwards when there's no room below.
export function CustomSelect({ options, value, onChange, placeholder = 'Select…' }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    function place() {
      const trigger = rootRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const wanted = Math.min(menuRef.current?.scrollHeight ?? MENU_MAX_HEIGHT, MENU_MAX_HEIGHT);
      const below = window.innerHeight - trigger.bottom - MENU_GAP - VIEWPORT_EDGE;
      const above = trigger.top - MENU_GAP - VIEWPORT_EDGE;
      const openUp = below < wanted && above > below;
      const maxHeight = Math.max(Math.min(MENU_MAX_HEIGHT, openUp ? above : below), 80);
      setPosition(openUp
        ? { left: trigger.left, width: trigger.width, maxHeight, bottom: window.innerHeight - trigger.top + MENU_GAP }
        : { left: trigger.left, width: trigger.width, maxHeight, top: trigger.bottom + MENU_GAP });
    }
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  return (
    <div className={`custom-select${open ? ' open' : ''}`} ref={rootRef}>
      <button type="button" className="custom-select-trigger" onClick={() => setOpen((o) => !o)}>
        <span>{selected?.label ?? placeholder}</span>
        <span className="cs-arrow">▼</span>
      </button>
      {open && createPortal(
      <div
        ref={menuRef}
        className="custom-select-menu"
        style={position
          ? { left: position.left, width: position.width, maxHeight: position.maxHeight, top: position.top, bottom: position.bottom }
          : { visibility: 'hidden', left: 0, top: 0 }}
      >
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
              {option.description && <span className="cs-option-desc">{option.description}</span>}
            </div>,
          );
          return nodes;
        })}
      </div>,
      document.body,
      )}
    </div>
  );
}
