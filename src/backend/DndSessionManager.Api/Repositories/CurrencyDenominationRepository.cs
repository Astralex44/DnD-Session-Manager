using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CurrencyDenominationRepository(AppDbContext context) : ICurrencyDenominationRepository
{
    public Task<CurrencyDenomination?> GetByIdAsync(Guid id) =>
        context.CurrencyDenominations.FirstOrDefaultAsync(d => d.Id == id);

    public async Task<IReadOnlyList<CurrencyDenomination>> GetAllAsync() =>
        await context.CurrencyDenominations.ToListAsync();

    public async Task<IReadOnlyList<CurrencyDenomination>> GetByGameIdAsync(Guid gameId) => await context.CurrencyDenominations
        .Where(d => d.GameId == gameId)
        .OrderBy(d => d.SortOrder)
        .ToListAsync();

    public Task AddAsync(CurrencyDenomination entity) => context.CurrencyDenominations.AddAsync(entity).AsTask();
    public void Remove(CurrencyDenomination entity) => context.CurrencyDenominations.Remove(entity);
}
