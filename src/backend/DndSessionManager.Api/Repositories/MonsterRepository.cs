using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class MonsterRepository(AppDbContext context) : IMonsterRepository
{
    public Task<Monster?> GetByIdAsync(Guid id) =>
        context.Monsters.FirstOrDefaultAsync(monster => monster.Id == id);

    public async Task<IReadOnlyList<Monster>> GetAllAsync() =>
        await context.Monsters.ToListAsync();

    public async Task<IReadOnlyList<Monster>> GetByGameIdAsync(Guid gameId) => await context.Monsters
        .Where(monster => monster.GameId == gameId)
        .OrderBy(monster => monster.Name)
        .ToListAsync();

    public Task AddAsync(Monster entity) => context.Monsters.AddAsync(entity).AsTask();
    public void Remove(Monster entity) => context.Monsters.Remove(entity);
}
