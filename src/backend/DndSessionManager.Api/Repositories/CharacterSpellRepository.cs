using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterSpellRepository(AppDbContext context) : ICharacterSpellRepository
{
    public Task<CharacterSpell?> GetByIdAsync(Guid id) =>
        context.CharacterSpells.FirstOrDefaultAsync(spell => spell.Id == id);

    public async Task<IReadOnlyList<CharacterSpell>> GetAllAsync() =>
        await context.CharacterSpells.ToListAsync();

    public async Task<IReadOnlyList<CharacterSpell>> GetByLevelSheetIdAsync(Guid levelSheetId) =>
        await context.CharacterSpells.Where(spell => spell.LevelSheetId == levelSheetId).ToListAsync();

    public Task AddAsync(CharacterSpell entity) => context.CharacterSpells.AddAsync(entity).AsTask();
    public void Remove(CharacterSpell entity) => context.CharacterSpells.Remove(entity);
}
