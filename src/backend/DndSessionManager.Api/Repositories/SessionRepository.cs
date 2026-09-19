using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class SessionRepository(AppDbContext context) : ISessionRepository
{
    public Task<Session?> GetByIdAsync(Guid id) =>
        context.Sessions.FirstOrDefaultAsync(session => session.Id == id);

    public async Task<IReadOnlyList<Session>> GetAllAsync() =>
        await context.Sessions.ToListAsync();

    public async Task<IReadOnlyList<Session>> GetByGameIdAsync(Guid gameId) => await context.Sessions
        .Where(session => session.GameId == gameId)
        .OrderByDescending(session => session.Number)
        .ToListAsync();

    public Task AddAsync(Session entity) => context.Sessions.AddAsync(entity).AsTask();
    public void Remove(Session entity) => context.Sessions.Remove(entity);
}
