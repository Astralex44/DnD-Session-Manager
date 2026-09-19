using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class ShopShareRepository(AppDbContext context) : IShopShareRepository
{
    public Task<ShopShare?> GetByIdAsync(Guid id) =>
        context.ShopShares.FirstOrDefaultAsync(share => share.Id == id);

    public async Task<IReadOnlyList<ShopShare>> GetAllAsync() =>
        await context.ShopShares.ToListAsync();

    public Task<ShopShare?> GetByShopAndCharacterAsync(Guid shopId, Guid characterId) =>
        context.ShopShares.FirstOrDefaultAsync(share => share.ShopId == shopId && share.CharacterId == characterId);

    public Task AddAsync(ShopShare entity) => context.ShopShares.AddAsync(entity).AsTask();
    public void Remove(ShopShare entity) => context.ShopShares.Remove(entity);
}
