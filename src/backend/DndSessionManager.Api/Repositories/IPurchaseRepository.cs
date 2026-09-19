using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IPurchaseRepository : IRepository<Purchase>
{
    Task<IReadOnlyList<Purchase>> GetByShopItemAndCharacterAsync(Guid shopItemId, Guid characterId);
    Task<IReadOnlyList<Purchase>> GetByCharacterIdAsync(Guid characterId);
}
