using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class SessionMonsterRepository(AppDbContext context) : ISessionMonsterRepository
{
    public Task<SessionMonster?> GetByIdAsync(Guid id) =>
        context.SessionMonsters.Include(m => m.Monster).FirstOrDefaultAsync(m => m.Id == id);

    public async Task<IReadOnlyList<SessionMonster>> GetAllAsync() =>
        await context.SessionMonsters.ToListAsync();

    public async Task<IReadOnlyList<SessionMonster>> GetByGameIdAsync(Guid gameId) => await context.SessionMonsters
        .Include(m => m.Monster)
        .Where(m => m.GameId == gameId)
        .OrderBy(m => m.CreatedAt)
        .ToListAsync();

    public Task AddAsync(SessionMonster entity) => context.SessionMonsters.AddAsync(entity).AsTask();
    public void Remove(SessionMonster entity) => context.SessionMonsters.Remove(entity);
}
