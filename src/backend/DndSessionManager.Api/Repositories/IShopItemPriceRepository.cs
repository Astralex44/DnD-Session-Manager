using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IShopItemPriceRepository : IRepository<ShopItemPrice>
{
    Task<IReadOnlyList<ShopItemPrice>> GetByShopItemIdAsync(Guid shopItemId);

    // Every price using this coin, with its item and shop loaded (currency-delete check).
    Task<IReadOnlyList<ShopItemPrice>> GetByDenominationIdAsync(Guid denominationId);
}
