using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class AccessLockRepository(AppDbContext context) : IAccessLockRepository
{
    public Task<AccessLock?> GetByIdAsync(Guid id) =>
        context.AccessLocks.FirstOrDefaultAsync(l => l.Id == id);

    public async Task<IReadOnlyList<AccessLock>> GetAllAsync() =>
        await context.AccessLocks.ToListAsync();

    public Task<AccessLock?> GetByResourceAsync(Guid gameId, string resourceType, string resourceKey) =>
        context.AccessLocks.FirstOrDefaultAsync(l =>
            l.GameId == gameId && l.ResourceType == resourceType && l.ResourceKey == resourceKey);

    public async Task<IReadOnlyList<AccessLock>> GetByGameAndTypeAsync(Guid gameId, string resourceType) =>
        await context.AccessLocks
            .Where(l => l.GameId == gameId && l.ResourceType == resourceType)
            .ToListAsync();

    public Task AddAsync(AccessLock entity) => context.AccessLocks.AddAsync(entity).AsTask();
    public void Remove(AccessLock entity) => context.AccessLocks.Remove(entity);
}
