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
import { useIsDm } from '../store/authStore.ts';

// Same route for both roles (Pflichtenheft 8.2); which panel set renders
// comes from the logged-in role, and the server enforces it either way.
export function BoardPage() {
  const isDm = useIsDm();

  return (
    <div className="board-page">
      <h2>Board</h2>
      <p className="hint">
        {isDm
          ? 'Live, synced across every viewer — Characters, Initiative, Dice, Timer, Monsters, Shop, and Maps.'
          : 'Live, synced with the table — your character, the initiative order, dice, and what the DM shares with you.'}
      </p>

      {isDm ? (
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
