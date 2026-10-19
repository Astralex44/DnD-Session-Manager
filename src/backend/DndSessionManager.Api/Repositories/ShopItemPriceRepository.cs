using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class ShopItemPriceRepository(AppDbContext context) : IShopItemPriceRepository
{
    public Task<ShopItemPrice?> GetByIdAsync(Guid id) =>
        context.ShopItemPrices.FirstOrDefaultAsync(price => price.Id == id);

    public async Task<IReadOnlyList<ShopItemPrice>> GetAllAsync() =>
        await context.ShopItemPrices.ToListAsync();

    public async Task<IReadOnlyList<ShopItemPrice>> GetByShopItemIdAsync(Guid shopItemId) => await context.ShopItemPrices
        .Where(price => price.ShopItemId == shopItemId)
        .ToListAsync();

    public async Task<IReadOnlyList<ShopItemPrice>> GetByDenominationIdAsync(Guid denominationId) => await context.ShopItemPrices
        .Where(p => p.CurrencyDenominationId == denominationId)
        .Include(p => p.ShopItem).ThenInclude(i => i!.Shop)
        .ToListAsync();

    public Task AddAsync(ShopItemPrice entity) => context.ShopItemPrices.AddAsync(entity).AsTask();
    public void Remove(ShopItemPrice entity) => context.ShopItemPrices.Remove(entity);
}
