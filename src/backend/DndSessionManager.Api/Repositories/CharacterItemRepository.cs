using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterItemRepository(AppDbContext context) : ICharacterItemRepository
{
    public Task<CharacterItem?> GetByIdAsync(Guid id) =>
        context.CharacterItems.FirstOrDefaultAsync(item => item.Id == id);

    public async Task<IReadOnlyList<CharacterItem>> GetAllAsync() =>
        await context.CharacterItems.ToListAsync();

    public async Task<IReadOnlyList<CharacterItem>> GetByCharacterIdAsync(Guid characterId) =>
        await context.CharacterItems.Where(item => item.CharacterId == characterId).ToListAsync();

    public Task AddAsync(CharacterItem entity) => context.CharacterItems.AddAsync(entity).AsTask();
    public void Remove(CharacterItem entity) => context.CharacterItems.Remove(entity);
}
