using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterSaveRepository(AppDbContext context) : ICharacterSaveRepository
{
    public Task<CharacterSave?> GetByIdAsync(Guid id) =>
        context.CharacterSaves.FirstOrDefaultAsync(save => save.Id == id);

    public async Task<IReadOnlyList<CharacterSave>> GetAllAsync() =>
        await context.CharacterSaves.ToListAsync();

    public async Task<IReadOnlyList<CharacterSave>> GetByCharacterIdAsync(Guid characterId) =>
        await context.CharacterSaves.Where(save => save.CharacterId == characterId).ToListAsync();

    public Task AddAsync(CharacterSave entity) => context.CharacterSaves.AddAsync(entity).AsTask();
    public void Remove(CharacterSave entity) => context.CharacterSaves.Remove(entity);
}
