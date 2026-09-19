export interface Session {
  id: string;
  gameId: string;
  number: number;
  title: string;
  scheduledAt: string | null;
  notes: string;
}

export interface UpsertSessionInput {
  title: string;
  scheduledAt: string | null;
  notes: string;
}
