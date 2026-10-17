using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class DiceRollRepository(AppDbContext context) : IDiceRollRepository
{
    public Task<DiceRoll?> GetByIdAsync(Guid id) =>
        context.DiceRolls.FirstOrDefaultAsync(r => r.Id == id);

    public async Task<IReadOnlyList<DiceRoll>> GetAllAsync() =>
        await context.DiceRolls.ToListAsync();

    public async Task<IReadOnlyList<DiceRoll>> GetByGameAndUserAsync(Guid gameId, Guid userId) => await context.DiceRolls
        .Where(r => r.GameId == gameId && r.UserId == userId)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

    public Task AddAsync(DiceRoll entity) => context.DiceRolls.AddAsync(entity).AsTask();
    public void Remove(DiceRoll entity) => context.DiceRolls.Remove(entity);
}
