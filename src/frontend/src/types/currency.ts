export interface CurrencyDenomination {
  id: string;
  gameId: string;
  name: string;
  abbreviation: string;
  color: string;
  value: number;
  sortOrder: number;
}

export interface UpsertCurrencyDenominationInput {
  name: string;
  abbreviation: string;
  color: string;
  value: number;
}

export interface CharacterCurrency {
  denominationId: string;
  name: string;
  abbreviation: string;
  color: string;
  quantity: number;
}
