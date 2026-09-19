using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterSkillRepository : IRepository<CharacterSkill>
{
    Task<IReadOnlyList<CharacterSkill>> GetByCharacterIdAsync(Guid characterId);
}
