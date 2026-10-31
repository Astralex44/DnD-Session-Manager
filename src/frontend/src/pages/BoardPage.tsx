import { useState } from 'react';
import { CalculatorPanel } from '../components/CalculatorPanel.tsx';
import { CharacterLivePanel } from '../components/CharacterLivePanel.tsx';
import { CharacterRoster } from '../components/CharacterRoster.tsx';
import { DiceRoller } from '../components/DiceRoller.tsx';
import { InitiativePanel } from '../components/InitiativePanel.tsx';
import { MapDmPanel } from '../components/MapDmPanel.tsx';
import { MapPlayerPanel } from '../components/MapPlayerPanel.tsx';
import { MonsterPanel } from '../components/MonsterPanel.tsx';
import { NotesPanel } from '../components/NotesPanel.tsx';
import { SessionNotesPanel } from '../components/SessionNotesPanel.tsx';
import { ShopDmPanel } from '../components/ShopDmPanel.tsx';
import { ShopPlayerPanel } from '../components/ShopPlayerPanel.tsx';
import { TimerPanel } from '../components/TimerPanel.tsx';
import { useIsDm } from '../store/authStore.ts';
import { useCharactersStore } from '../store/charactersStore.ts';

// Same route for both roles (Pflichtenheft 8.2); which panel set renders
// comes from the logged-in role, and the server enforces it either way.
// NFA-04 "view as player": the DM can switch to exactly what one player
// sees (their characters, their shares and shops) to enter things on their
// behalf in hybrid play. Private things stay private in that view — the
// player's notes and dice history aren't shown; the dice panel only lets the
// DM file a real-dice roll for them.
export function BoardPage() {
  const isDm = useIsDm();
  const { characters } = useCharactersStore();
  const [viewingAs, setViewingAs] = useState<string | null>(null);

  const viewedCharacters = viewingAs ? characters.filter((c) => c.ownerUserId === viewingAs) : [];
  const viewedName = viewedCharacters[0]?.ownerUsername ?? 'player';

  if (isDm && viewingAs) {
    return (
      <div className="board-page">
        <div className="view-as-banner">
          <span>
            Viewing the Board as <strong>{viewedName}</strong> ({viewedCharacters.map((c) => c.name).join(', ')}) —
            exactly what they see. Anything you change here, you change for them.
          </span>
          <button onClick={() => setViewingAs(null)}>Back to DM view</button>
        </div>
        <PlayerBoard
          key={viewingAs}
          onlyCharacterIds={viewedCharacters.map((c) => c.id)}
          enterDiceFor={{ userId: viewingAs, name: viewedName }}
        />
      </div>
    );
  }

  return (
    <div className="board-page">
      <h2>Board</h2>
      <p className="hint">
        {isDm
          ? 'Live, synced across every viewer — Characters, Initiative, Dice, Timer, Monsters, Shop, Maps, and Documents.'
          : 'Live, synced with the table — your character, the initiative order, dice, and what the DM shares with you.'}
      </p>

      {isDm ? (
        <div className="board-grid">
          <CharacterRoster onViewAs={setViewingAs} />
          <InitiativePanel editable />
          <div className="panel">
            <div className="panel-header"><h3>Dice</h3></div>
            <div className="panel-body"><DiceRoller key="dm-dice" /></div>
          </div>
          <TimerPanel editable />
          <MonsterPanel />
          <ShopDmPanel />
          <MapDmPanel />
          <MapDmPanel type="Book" />
          <CalculatorPanel />
          <NotesPanel wide />
          <SessionNotesPanel />
        </div>
      ) : (
        <PlayerBoard />
      )}
    </div>
  );
}

interface PlayerBoardProps {
  onlyCharacterIds?: string[];
  enterDiceFor?: { userId: string; name: string };
}

// The player's panel set — for a player, and for the DM's "view as" (where
// the notes panel is left out: those notes are private to the player).
function PlayerBoard({ onlyCharacterIds, enterDiceFor }: PlayerBoardProps) {
  return (
    // Three full-width columns like the DM's Board, ordered so no row has a
    // gap: character (2) + dice / initiative, timer, shop / maps (2) +
    // documents / calculator + notes (2).
    <div className="board-grid player">
      <CharacterLivePanel onlyCharacterIds={onlyCharacterIds} />
      <div className="panel">
        <div className="panel-header"><h3>Dice</h3></div>
        <div className="panel-body"><DiceRoller key="player-dice" enterFor={enterDiceFor} /></div>
      </div>
      <InitiativePanel editable={false} />
      <TimerPanel editable={false} />
      <ShopPlayerPanel onlyCharacterIds={onlyCharacterIds} />
      <MapPlayerPanel onlyCharacterIds={onlyCharacterIds} />
      <MapPlayerPanel onlyCharacterIds={onlyCharacterIds} type="Book" />
      <CalculatorPanel />
      {!enterDiceFor && <NotesPanel wide />}
    </div>
  );
}
