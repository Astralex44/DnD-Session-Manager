using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterSpellSlotRepository : IRepository<CharacterSpellSlot>
{
    Task<IReadOnlyList<CharacterSpellSlot>> GetByLevelSheetIdAsync(Guid levelSheetId);
}
