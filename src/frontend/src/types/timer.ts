export interface GameTimer {
  id: string;
  label: string;
  endsAt: string;
}

export interface CreateTimerInput {
  label: string;
  durationSeconds: number;
}
