export interface SessionMonster {
  id: string;
  gameId: string;
  monsterId: string | null;
  monsterFileUrl: string | null;
  name: string;
  hpCurrent: number;
  hpMax: number;
  createdAt: string;
}

export interface CreateSessionMonsterInput {
  monsterId?: string;
  name?: string;
  hpMax?: number;
}
