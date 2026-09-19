using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class ShopItemRepository(AppDbContext context) : IShopItemRepository
{
    public Task<ShopItem?> GetByIdAsync(Guid id) => context.ShopItems
        .Include(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .FirstOrDefaultAsync(item => item.Id == id);

    public async Task<IReadOnlyList<ShopItem>> GetAllAsync() => await context.ShopItems
        .Include(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .ToListAsync();

    public async Task<IReadOnlyList<ShopItem>> GetByShopIdAsync(Guid shopId) => await context.ShopItems
        .Where(item => item.ShopId == shopId)
        .Include(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .ToListAsync();

    public Task AddAsync(ShopItem entity) => context.ShopItems.AddAsync(entity).AsTask();
    public void Remove(ShopItem entity) => context.ShopItems.Remove(entity);
}
