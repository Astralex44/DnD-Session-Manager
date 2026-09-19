using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterLevelSheetRepository(AppDbContext context) : ICharacterLevelSheetRepository
{
    public Task<CharacterLevelSheet?> GetByIdAsync(Guid id) => context.CharacterLevelSheets
        .Include(sheet => sheet.Spellcasting)
        .Include(sheet => sheet.Spells)
        .Include(sheet => sheet.SpellSlots)
        .FirstOrDefaultAsync(sheet => sheet.Id == id);

    public async Task<IReadOnlyList<CharacterLevelSheet>> GetAllAsync() =>
        await context.CharacterLevelSheets.ToListAsync();

    public async Task<IReadOnlyList<CharacterLevelSheet>> GetByCharacterIdAsync(Guid characterId) =>
        await context.CharacterLevelSheets
            .Where(sheet => sheet.CharacterId == characterId)
            .OrderBy(sheet => sheet.Level)
            .ToListAsync();

    public Task AddAsync(CharacterLevelSheet entity) => context.CharacterLevelSheets.AddAsync(entity).AsTask();
    public void Remove(CharacterLevelSheet entity) => context.CharacterLevelSheets.Remove(entity);
}
