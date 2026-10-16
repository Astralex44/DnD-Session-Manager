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

    public Task<int> CountByGameAsync(Guid gameId) =>
        context.GameMembers.CountAsync(m => m.GameId == gameId);

    public Task AddAsync(GameMember entity) => context.GameMembers.AddAsync(entity).AsTask();
    public void Remove(GameMember entity) => context.GameMembers.Remove(entity);
}
