export interface DiceRoll {
  id: string;
  expression: string;
  dice: string; // "4,2" for an app roll, empty for a physical one
  total: number;
  isPhysical: boolean;
  enteredByOther: boolean; // the DM typed this in for you
  createdAt: string;
}
