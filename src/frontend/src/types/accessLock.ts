export type ResourceType = 'Character' | 'NotesOwner';

export interface AccessLockStatus {
  locked: boolean;
}

export interface AccessCodeResult {
  ok: boolean;
  error: string | null;
}
