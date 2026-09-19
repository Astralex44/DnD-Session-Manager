using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterSpellSlotRepository(AppDbContext context) : ICharacterSpellSlotRepository
{
    public Task<CharacterSpellSlot?> GetByIdAsync(Guid id) =>
        context.CharacterSpellSlots.FirstOrDefaultAsync(slot => slot.Id == id);

    public async Task<IReadOnlyList<CharacterSpellSlot>> GetAllAsync() =>
        await context.CharacterSpellSlots.ToListAsync();

    public async Task<IReadOnlyList<CharacterSpellSlot>> GetByLevelSheetIdAsync(Guid levelSheetId) =>
        await context.CharacterSpellSlots.Where(slot => slot.LevelSheetId == levelSheetId).ToListAsync();

    public Task AddAsync(CharacterSpellSlot entity) => context.CharacterSpellSlots.AddAsync(entity).AsTask();
    public void Remove(CharacterSpellSlot entity) => context.CharacterSpellSlots.Remove(entity);
}
