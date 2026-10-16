using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class GameMemberRepository(AppDbContext context) : IGameMemberRepository
{
    public Task<GameMember?> GetByIdAsync(Guid id) =>
        context.GameMembers.FirstOrDefaultAsync(m => m.Id == id);

    public async Task<IReadOnlyList<GameMember>> GetAllAsync() =>
        await context.GameMembers.ToListAsync();

    public Task<GameMember?> GetByGameAndUserAsync(Guid gameId, Guid userId) =>
        context.GameMembers.FirstOrDefaultAsync(m => m.GameId == gameId && m.UserId == userId);

    public async Task<IReadOnlyList<GameMember>> GetByGameIdAsync(Guid gameId) => await context.GameMembers
        .Where(m => m.GameId == gameId)
        .Include(m => m.User)
        .OrderBy(m => m.CreatedAt)
        .ToListAsync();

    public Task AddAsync(GameMember entity) => context.GameMembers.AddAsync(entity).AsTask();
    public void Remove(GameMember entity) => context.GameMembers.Remove(entity);
}
