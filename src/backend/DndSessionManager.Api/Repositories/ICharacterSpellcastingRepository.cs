using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterSpellcastingRepository : IRepository<CharacterSpellcasting>
{
    Task<CharacterSpellcasting?> GetByLevelSheetIdAsync(Guid levelSheetId);
}
