using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class GameTimerRepository(AppDbContext context) : IGameTimerRepository
{
    public Task<GameTimer?> GetByIdAsync(Guid id) =>
        context.GameTimers.FirstOrDefaultAsync(timer => timer.Id == id);

    public async Task<IReadOnlyList<GameTimer>> GetAllAsync() =>
        await context.GameTimers.ToListAsync();

    public async Task<IReadOnlyList<GameTimer>> GetByGameIdAsync(Guid gameId) => await context.GameTimers
        .Where(timer => timer.GameId == gameId)
        .OrderBy(timer => timer.CreatedAt)
        .ToListAsync();

    public Task AddAsync(GameTimer entity) => context.GameTimers.AddAsync(entity).AsTask();
    public void Remove(GameTimer entity) => context.GameTimers.Remove(entity);
}
