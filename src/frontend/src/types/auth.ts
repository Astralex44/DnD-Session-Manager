export type GameRole = 'Dm' | 'Player';

// GET /api/auth/me — who's logged in and which game they're in.
export interface Me {
  userId: string;
  username: string;
  avatarUrl: string | null;
  gameId: string;
  role: GameRole;
}

export interface GameMember {
  id: string;
  userId: string;
  username: string;
  discordHandle: string;
  avatarUrl: string | null;
  role: GameRole;
  joinedAt: string;
}

export interface GameInvite {
  id: string;
  discordHandle: string;
  createdAt: string;
}

// GET /api/games/{gameId}/access — the DM's access list.
export interface GameAccessList {
  members: GameMember[];
  invites: GameInvite[];
}
