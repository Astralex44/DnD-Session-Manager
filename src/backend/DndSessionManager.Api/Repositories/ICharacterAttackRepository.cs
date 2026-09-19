using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterAttackRepository : IRepository<CharacterAttack>
{
    Task<IReadOnlyList<CharacterAttack>> GetByCharacterIdAsync(Guid characterId);
}
