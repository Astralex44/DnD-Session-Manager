using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterItemRepository : IRepository<CharacterItem>
{
    Task<IReadOnlyList<CharacterItem>> GetByCharacterIdAsync(Guid characterId);
}
