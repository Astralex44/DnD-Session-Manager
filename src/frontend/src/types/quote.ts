export interface Quote {
  id: string;
  gameId: string;
  text: string;
  isShared: boolean;
  createdAt: string;
  sessionId: string | null;
  sessionNumber: number | null;
  characterId: string | null;
  characterName: string | null;
  playerName: string | null;
}

export interface CreateQuoteInput {
  text: string;
  sessionId?: string | null;
  characterId?: string | null;
}
