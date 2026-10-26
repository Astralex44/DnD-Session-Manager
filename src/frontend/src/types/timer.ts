export interface GameTimerTarget {
  characterId: string;
  name: string;
}

export interface GameTimer {
  id: string;
  label: string;
  endsAt: string;
  // Empty = a timer for everyone at the table.
  targets: GameTimerTarget[];
}

export interface CreateTimerInput {
  label: string;
  durationSeconds: number;
  // Empty = everyone.
  characterIds: string[];
}
