using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class ShopRepository(AppDbContext context) : IShopRepository
{
    public Task<Shop?> GetByIdAsync(Guid id) => context.Shops
        .Include(shop => shop.Items).ThenInclude(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .Include(shop => shop.Shares)
        .FirstOrDefaultAsync(shop => shop.Id == id);

    public async Task<IReadOnlyList<Shop>> GetAllAsync() => await context.Shops
        .Include(shop => shop.Items).ThenInclude(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .Include(shop => shop.Shares)
        .ToListAsync();

    public async Task<IReadOnlyList<Shop>> GetByGameIdAsync(Guid gameId) => await context.Shops
        .Where(shop => shop.GameId == gameId)
        .Include(shop => shop.Items).ThenInclude(item => item.Prices).ThenInclude(price => price.CurrencyDenomination)
        .Include(shop => shop.Shares)
        .OrderBy(shop => shop.Name)
        .ToListAsync();

    public Task AddAsync(Shop entity) => context.Shops.AddAsync(entity).AsTask();
    public void Remove(Shop entity) => context.Shops.Remove(entity);
}
