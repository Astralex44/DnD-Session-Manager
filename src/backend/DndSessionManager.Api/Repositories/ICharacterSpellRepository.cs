using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterSpellRepository : IRepository<CharacterSpell>
{
    Task<IReadOnlyList<CharacterSpell>> GetByLevelSheetIdAsync(Guid levelSheetId);
}
