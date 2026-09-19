using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterCurrencyRepository : IRepository<CharacterCurrency>
{
    Task<IReadOnlyList<CharacterCurrency>> GetByCharacterIdAsync(Guid characterId);
    Task<CharacterCurrency?> GetByCharacterAndDenominationAsync(Guid characterId, Guid denominationId);
}
