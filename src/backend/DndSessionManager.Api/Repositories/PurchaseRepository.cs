using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class PurchaseRepository(AppDbContext context) : IPurchaseRepository
{
    public Task<Purchase?> GetByIdAsync(Guid id) =>
        context.Purchases.FirstOrDefaultAsync(purchase => purchase.Id == id);

    public async Task<IReadOnlyList<Purchase>> GetAllAsync() =>
        await context.Purchases.ToListAsync();

    public async Task<IReadOnlyList<Purchase>> GetByShopItemAndCharacterAsync(Guid shopItemId, Guid characterId) => await context.Purchases
        .Where(purchase => purchase.ShopItemId == shopItemId && purchase.CharacterId == characterId)
        .ToListAsync();

    public async Task<IReadOnlyList<Purchase>> GetByCharacterIdAsync(Guid characterId) => await context.Purchases
        .Where(purchase => purchase.CharacterId == characterId)
        .Include(purchase => purchase.ShopItem)
        .OrderByDescending(purchase => purchase.PurchasedAt)
        .ToListAsync();

    public Task AddAsync(Purchase entity) => context.Purchases.AddAsync(entity).AsTask();
    public void Remove(Purchase entity) => context.Purchases.Remove(entity);
}
