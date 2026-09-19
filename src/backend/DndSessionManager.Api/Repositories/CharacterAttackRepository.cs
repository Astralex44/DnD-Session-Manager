using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterAttackRepository(AppDbContext context) : ICharacterAttackRepository
{
    public Task<CharacterAttack?> GetByIdAsync(Guid id) =>
        context.CharacterAttacks.FirstOrDefaultAsync(attack => attack.Id == id);

    public async Task<IReadOnlyList<CharacterAttack>> GetAllAsync() =>
        await context.CharacterAttacks.ToListAsync();

    public async Task<IReadOnlyList<CharacterAttack>> GetByCharacterIdAsync(Guid characterId) =>
        await context.CharacterAttacks.Where(attack => attack.CharacterId == characterId).ToListAsync();

    public Task AddAsync(CharacterAttack entity) => context.CharacterAttacks.AddAsync(entity).AsTask();
    public void Remove(CharacterAttack entity) => context.CharacterAttacks.Remove(entity);
}
