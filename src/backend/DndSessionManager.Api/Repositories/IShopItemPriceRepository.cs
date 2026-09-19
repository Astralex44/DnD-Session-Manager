using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IShopItemPriceRepository : IRepository<ShopItemPrice>
{
    Task<IReadOnlyList<ShopItemPrice>> GetByShopItemIdAsync(Guid shopItemId);
}
