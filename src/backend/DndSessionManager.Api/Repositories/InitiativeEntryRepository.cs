using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class InitiativeEntryRepository(AppDbContext context) : IInitiativeEntryRepository
{
    public Task<InitiativeEntry?> GetByIdAsync(Guid id) =>
        context.InitiativeEntries.FirstOrDefaultAsync(entry => entry.Id == id);

    public async Task<IReadOnlyList<InitiativeEntry>> GetAllAsync() =>
        await context.InitiativeEntries.ToListAsync();

    public async Task<IReadOnlyList<InitiativeEntry>> GetByGameIdAsync(Guid gameId) => await context.InitiativeEntries
        .Where(entry => entry.GameId == gameId)
        .OrderByDescending(entry => entry.Value)
        .ThenBy(entry => entry.CreatedAt)
        .ToListAsync();

    public Task AddAsync(InitiativeEntry entity) => context.InitiativeEntries.AddAsync(entity).AsTask();
    public void Remove(InitiativeEntry entity) => context.InitiativeEntries.Remove(entity);
}
