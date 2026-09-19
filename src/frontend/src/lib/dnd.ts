import type { CharacterDetail, UpdateCharacterInput } from '../types/character.ts';

// Shared D&D house-rule helpers — kept in one place so Board and the
// character sheet can never drift out of sync on how a modifier is computed.

export const ABILITY_SHORT: Record<string, string> = {
  Strength: 'STR',
  Dexterity: 'DEX',
  Constitution: 'CON',
  Intelligence: 'INT',
  Wisdom: 'WIS',
  Charisma: 'CHA',
};

// House rule (confirmed with the DM, deviates from RAW): above 10, standard
// 5e pairing (every 2 points = +1). Below 10, a full -1 per point instead of
// per 2 — low stats hurt more at this table. 9=-1, 8=-2, 7=-3, 6=-4, etc.
export function modifier(score: number): number {
  return score >= 10 ? Math.floor((score - 10) / 2) : score - 10;
}

export function fmtMod(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// UpdateCharacterInput is CharacterDetail minus its server-owned/relational
// fields — any partial update (e.g. Board's HP-only edit) still needs to
// send the whole shape, so this stays in one place rather than being
// re-derived (and risking drifting) everywhere a character gets PATCHed.
export function toUpdateCharacterInput(c: CharacterDetail): UpdateCharacterInput {
  const { levelSheets: _ls, activeLevelSheet: _als, skills: _sk, saves: _sv, attacks: _at, items: _it, ...rest } = c;
  void _ls; void _als; void _sk; void _sv; void _at; void _it;
  return rest;
}
