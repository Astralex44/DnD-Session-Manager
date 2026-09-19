using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterSkillRepository(AppDbContext context) : ICharacterSkillRepository
{
    public Task<CharacterSkill?> GetByIdAsync(Guid id) =>
        context.CharacterSkills.FirstOrDefaultAsync(skill => skill.Id == id);

    public async Task<IReadOnlyList<CharacterSkill>> GetAllAsync() =>
        await context.CharacterSkills.ToListAsync();

    public async Task<IReadOnlyList<CharacterSkill>> GetByCharacterIdAsync(Guid characterId) =>
        await context.CharacterSkills.Where(skill => skill.CharacterId == characterId).ToListAsync();

    public Task AddAsync(CharacterSkill entity) => context.CharacterSkills.AddAsync(entity).AsTask();
    public void Remove(CharacterSkill entity) => context.CharacterSkills.Remove(entity);
}
