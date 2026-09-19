using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterSpellcastingRepository(AppDbContext context) : ICharacterSpellcastingRepository
{
    public Task<CharacterSpellcasting?> GetByIdAsync(Guid id) =>
        context.CharacterSpellcastings.FirstOrDefaultAsync(spellcasting => spellcasting.Id == id);

    public async Task<IReadOnlyList<CharacterSpellcasting>> GetAllAsync() =>
        await context.CharacterSpellcastings.ToListAsync();

    public Task<CharacterSpellcasting?> GetByLevelSheetIdAsync(Guid levelSheetId) =>
        context.CharacterSpellcastings.FirstOrDefaultAsync(spellcasting => spellcasting.LevelSheetId == levelSheetId);

    public Task AddAsync(CharacterSpellcasting entity) => context.CharacterSpellcastings.AddAsync(entity).AsTask();
    public void Remove(CharacterSpellcasting entity) => context.CharacterSpellcastings.Remove(entity);
}
