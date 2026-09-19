export interface InitiativeEntry {
  id: string;
  name: string;
  value: number;
  isMonster: boolean;
  isActive: boolean;
}

export interface Initiative {
  round: number;
  entries: InitiativeEntry[];
}

export interface CreateInitiativeEntryInput {
  name: string;
  value: number;
  isMonster: boolean;
}
