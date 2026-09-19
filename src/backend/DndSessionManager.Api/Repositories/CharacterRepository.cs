using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterRepository(AppDbContext context) : ICharacterRepository
{
    public Task<Character?> GetByIdAsync(Guid id) => context.Characters
        .Include(character => character.ActiveLevelSheet)
        .Include(character => character.Skills)
        .Include(character => character.Saves)
        .Include(character => character.Attacks)
        .Include(character => character.Items)
        .Include(character => character.LevelSheets)
        .FirstOrDefaultAsync(character => character.Id == id);

    public async Task<IReadOnlyList<Character>> GetAllAsync() => await context.Characters
        .Include(character => character.ActiveLevelSheet).ToListAsync();

    public async Task<IReadOnlyList<Character>> GetByGameIdAsync(Guid gameId) => await context.Characters
        .Where(character => character.GameId == gameId)
        .Include(character => character.ActiveLevelSheet)
        .OrderBy(character => character.Name).ToListAsync();

    public Task AddAsync(Character entity) => context.Characters.AddAsync(entity).AsTask();
    public void Remove(Character entity) => context.Characters.Remove(entity);
}
