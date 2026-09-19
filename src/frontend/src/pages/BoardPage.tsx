import { useState } from 'react';
import { CharacterLivePanel } from '../components/CharacterLivePanel.tsx';
import { CharacterRoster } from '../components/CharacterRoster.tsx';
import { DiceRoller } from '../components/DiceRoller.tsx';
import { InitiativePanel } from '../components/InitiativePanel.tsx';
import { MapDmPanel } from '../components/MapDmPanel.tsx';
import { MapPlayerPanel } from '../components/MapPlayerPanel.tsx';
import { MonsterPanel } from '../components/MonsterPanel.tsx';
import { ShopDmPanel } from '../components/ShopDmPanel.tsx';
import { ShopPlayerPanel } from '../components/ShopPlayerPanel.tsx';
import { TimerPanel } from '../components/TimerPanel.tsx';

type Role = 'dm' | 'player';

// No auth yet, so this is the same demo-mode stand-in used everywhere else
// in the app (character/owner pickers) — a manual toggle previews both
// views, matching how the static mockup itself demos DM vs. player.
export function BoardPage() {
  const [role, setRole] = useState<Role>('dm');

  return (
    <div className="board-page">
      <h2>Board</h2>
      <p className="hint">Live, synced across every viewer — Characters, Initiative, Dice, Timer, Monsters, Shop, and Maps.</p>

      <div className="role-toggle">
        <button className={role === 'dm' ? 'active' : ''} onClick={() => setRole('dm')}>DM View</button>
        <button className={role === 'player' ? 'active' : ''} onClick={() => setRole('player')}>Player View</button>
      </div>

      {role === 'dm' ? (
        <div className="board-grid">
          <CharacterRoster />
          <InitiativePanel editable />
          <div className="panel">
            <div className="panel-header"><h3>Dice</h3></div>
            <div className="panel-body"><DiceRoller key="dm-dice" /></div>
          </div>
          <TimerPanel />
          <MonsterPanel />
          <ShopDmPanel />
          <MapDmPanel />
        </div>
      ) : (
        <div className="board-grid player">
          <CharacterLivePanel />
          <InitiativePanel editable={false} />
          <div className="panel">
            <div className="panel-header"><h3>Dice</h3></div>
            <div className="panel-body"><DiceRoller key="player-dice" /></div>
          </div>
          <ShopPlayerPanel />
          <MapPlayerPanel />
        </div>
      )}
    </div>
  );
}
