export type ShopSaleMode = 'SharedStock' | 'PerPlayerLimited';

export interface ShopItemPrice {
  denominationId: string;
  abbreviation: string;
  color: string;
  amount: number;
}

// The DM's fixed shop categories, in display order. Mirrors the backend's
// Entities/ShopItemCategories.cs — change both together.
export const SHOP_ITEM_CATEGORIES = [
  'Armor and shields', 'Weapons', 'Adventuring gear', 'Tools',
  'Spellcasting focus', 'Gemstones', 'Poisons', 'Miscellaneous',
] as const;

// Items grouped by category in list order; empty categories left out.
export function groupByCategory<T extends { category: string }>(items: T[]): { category: string; items: T[] }[] {
  return SHOP_ITEM_CATEGORIES
    .map((category) => ({ category: category as string, items: items.filter((i) => i.category === category) }))
    .filter((group) => group.items.length > 0);
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  weight: number;
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
  // Free text, '' = no location.
  location: string;
  items: ShopItem[];
  shares: ShopShare[];
}

export interface CreateShopInput {
  name: string;
  description: string;
  location: string;
}

// Location filter (Manage → Shops and the Board's shop picker): every
// location in use, sorted; shops without one fall under NO_LOCATION.
export const ALL_LOCATIONS = '__all__';
export const NO_LOCATION = '__none__';
export const NO_LOCATION_LABEL = 'No location';

export function shopLocations(shops: { location: string }[]): string[] {
  return [...new Set(shops.map((s) => s.location.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

export function locationFilterOptions(shops: { location: string }[]): { value: string; label: string }[] {
  return [
    { value: ALL_LOCATIONS, label: 'All locations' },
    ...shopLocations(shops).map((l) => ({ value: l, label: l })),
    ...(shops.some((s) => !s.location.trim()) ? [{ value: NO_LOCATION, label: NO_LOCATION_LABEL }] : []),
  ];
}

export function matchesLocation(shop: { location: string }, filter: string): boolean {
  if (filter === ALL_LOCATIONS) return true;
  if (filter === NO_LOCATION) return !shop.location.trim();
  return shop.location.trim() === filter;
}

export interface CreateShopItemPriceInput {
  denominationId: string;
  amount: number;
}

export interface CreateShopItemInput {
  name: string;
  description: string;
  icon: string;
  category: string;
  weight: number;
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
