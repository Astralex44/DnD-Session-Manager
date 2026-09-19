using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IShopShareRepository : IRepository<ShopShare>
{
    Task<ShopShare?> GetByShopAndCharacterAsync(Guid shopId, Guid characterId);
}
