export type DocumentType = 'Map' | 'Book';

export interface DocumentShare {
  id: string;
  characterId: string;
  characterName: string;
  hidden: boolean;
  locked: boolean;
}

export interface GameDocument {
  id: string;
  gameId: string;
  type: DocumentType;
  name: string;
  fileUrl: string;
  originalFileName: string;
  uploadedAt: string;
  shares: DocumentShare[];
}

export type ShareState = 'none' | 'visible' | 'hidden' | 'locked';

export function shareState(share: DocumentShare | undefined): ShareState {
  if (!share) return 'none';
  if (share.locked) return 'locked';
  if (share.hidden) return 'hidden';
  return 'visible';
}
