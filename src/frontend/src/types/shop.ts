export type ShopSaleMode = 'SharedStock' | 'PerPlayerLimited';

export interface ShopItemPrice {
  denominationId: string;
  abbreviation: string;
  color: string;
  amount: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  saleMode: ShopSaleMode;
  stockQuantity: number | null;
  maxPerCharacter: number | null;
  prices: ShopItemPrice[];
}

export interface ShopShare {
  id: string;
  characterId: string;
  characterName: string;
  hidden: boolean;
  locked: boolean;
}

export interface Shop {
  id: string;
  gameId: string;
  name: string;
  description: string;
  items: ShopItem[];
  shares: ShopShare[];
}

export interface CreateShopInput {
  name: string;
  description: string;
}

export interface CreateShopItemPriceInput {
  denominationId: string;
  amount: number;
}

export interface CreateShopItemInput {
  name: string;
  description: string;
  icon: string;
  saleMode: ShopSaleMode;
  stockQuantity: number | null;
  maxPerCharacter: number | null;
  prices: CreateShopItemPriceInput[];
}

export interface UpsertShopShareInput {
  hidden: boolean;
  locked: boolean;
}

export interface CreatePurchaseInput {
  characterId: string;
  quantity: number;
  // A DM negotiating a price mid-session can charge something other than the
  // item's configured price for this one sale. Omit to use the item's normal price.
  overridePrices?: CreateShopItemPriceInput[];
}

export type ShareState = 'none' | 'visible' | 'hidden' | 'locked';

export function shareState(share: ShopShare | undefined): ShareState {
  if (!share) return 'none';
  if (share.locked) return 'locked';
  if (share.hidden) return 'hidden';
  return 'visible';
}

export interface Purchase {
  id: string;
  shopItemId: string;
  shopItemName: string;
  characterId: string;
  characterName: string;
  quantity: number;
  purchasedAt: string;
  totalPaid: ShopItemPrice[];
}
