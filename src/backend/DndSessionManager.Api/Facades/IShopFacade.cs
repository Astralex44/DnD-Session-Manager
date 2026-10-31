using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IShopFacade
{
    // The DM gets everything. A player gets only shops shared with one of
    // their own characters, and only their own characters' share rows.
    Task<IReadOnlyList<ShopDto>> GetShopsForGameAsync(Guid gameId, GameCaller caller);
    Task<ShopDto?> GetShopAsync(Guid gameId, Guid shopId, GameCaller caller);
    Task<ShopDto> CreateShopAsync(Guid gameId, CreateShopDto input);
    Task<ShopDto?> UpdateShopAsync(Guid gameId, Guid shopId, UpdateShopDto input);
    Task<bool> DeleteShopAsync(Guid gameId, Guid shopId);

    // DM: any share. Player: Hide/Lock on an existing share of their own
    // character only — shops aren't handed on like documents.
    Task<(ShopShareDto? Share, bool Forbidden)> SetShareAsync(Guid gameId, Guid shopId, Guid characterId, UpsertShopShareDto input, GameCaller caller);
    Task<bool> RemoveShareAsync(Guid gameId, Guid shopId, Guid characterId);

    // DM, "share with everyone" / "unshare all" — same semantics as the
    // document ones: missing shares added, hidden ones shown, locks kept.
    Task<bool> ShareWithAllAsync(Guid gameId, Guid shopId);
    Task<bool> RemoveAllSharesAsync(Guid gameId, Guid shopId);

    // FA-11 "set the sale mode for the whole shop at once": plain application
    // logic writing the mode onto every item (Pflichtenheft — no column on
    // Shop). Null when the shop doesn't exist or the mode isn't valid.
    Task<ShopDto?> SetSaleModeForAllItemsAsync(Guid gameId, Guid shopId, SetShopSaleModeDto input);

    Task<ShopItemDto?> AddItemAsync(Guid gameId, Guid shopId, CreateShopItemDto input);
    Task<ShopItemDto?> UpdateItemAsync(Guid gameId, Guid shopId, Guid itemId, UpdateShopItemDto input);
    Task<bool> RemoveItemAsync(Guid gameId, Guid shopId, Guid itemId);

    // DM: for any character, with optional negotiated prices. Player: for their
    // own character, from a shop shared with it, at the listed price only.
    Task<(PurchaseResultDto? Result, bool Forbidden)> PurchaseAsync(Guid gameId, Guid shopId, Guid itemId, CreatePurchaseDto input, GameCaller caller);
}
