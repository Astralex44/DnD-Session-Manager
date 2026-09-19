using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class InitiativeStateRepository(AppDbContext context) : IInitiativeStateRepository
{
    public Task<InitiativeState?> GetByIdAsync(Guid id) =>
        context.InitiativeStates.FirstOrDefaultAsync(state => state.Id == id);

    public async Task<IReadOnlyList<InitiativeState>> GetAllAsync() =>
        await context.InitiativeStates.ToListAsync();

    public Task<InitiativeState?> GetByGameIdAsync(Guid gameId) =>
        context.InitiativeStates.FirstOrDefaultAsync(state => state.GameId == gameId);

    public Task AddAsync(InitiativeState entity) => context.InitiativeStates.AddAsync(entity).AsTask();
    public void Remove(InitiativeState entity) => context.InitiativeStates.Remove(entity);
}
