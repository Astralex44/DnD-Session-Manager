using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterLevelSheetRepository : IRepository<CharacterLevelSheet>
{
    Task<IReadOnlyList<CharacterLevelSheet>> GetByCharacterIdAsync(Guid characterId);
}
