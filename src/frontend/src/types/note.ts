// aboutCharacterId is set on the DM's notebook pages about one character.
export interface Note {
  id: string;
  gameId: string;
  aboutCharacterId: string | null;
  title: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}
