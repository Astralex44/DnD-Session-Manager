using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterSaveRepository : IRepository<CharacterSave>
{
    Task<IReadOnlyList<CharacterSave>> GetByCharacterIdAsync(Guid characterId);
}
