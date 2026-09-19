using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IShopFacade
{
    Task<IReadOnlyList<ShopDto>> GetShopsForGameAsync(Guid gameId);
    Task<ShopDto?> GetShopAsync(Guid gameId, Guid shopId);
    Task<ShopDto> CreateShopAsync(Guid gameId, CreateShopDto input);
    Task<ShopDto?> UpdateShopAsync(Guid gameId, Guid shopId, UpdateShopDto input);
    Task<bool> DeleteShopAsync(Guid gameId, Guid shopId);

    Task<ShopShareDto?> SetShareAsync(Guid gameId, Guid shopId, Guid characterId, UpsertShopShareDto input);
    Task<bool> RemoveShareAsync(Guid gameId, Guid shopId, Guid characterId);

    Task<ShopItemDto?> AddItemAsync(Guid gameId, Guid shopId, CreateShopItemDto input);
    Task<ShopItemDto?> UpdateItemAsync(Guid gameId, Guid shopId, Guid itemId, UpdateShopItemDto input);
    Task<bool> RemoveItemAsync(Guid gameId, Guid shopId, Guid itemId);

    Task<PurchaseResultDto?> PurchaseAsync(Guid gameId, Guid shopId, Guid itemId, CreatePurchaseDto input);
}
