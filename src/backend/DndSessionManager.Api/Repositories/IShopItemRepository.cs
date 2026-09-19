using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IShopItemRepository : IRepository<ShopItem>
{
    Task<IReadOnlyList<ShopItem>> GetByShopIdAsync(Guid shopId);
}
