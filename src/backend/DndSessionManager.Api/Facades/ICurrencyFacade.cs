using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface ICurrencyFacade
{
    Task<IReadOnlyList<CurrencyDenominationDto>> GetDenominationsForGameAsync(Guid gameId);
    Task<CurrencyDenominationDto> CreateDenominationAsync(Guid gameId, UpsertCurrencyDenominationDto input);
    Task<CurrencyDenominationDto?> UpdateDenominationAsync(Guid gameId, Guid id, UpsertCurrencyDenominationDto input);
    Task<bool> DeleteDenominationAsync(Guid gameId, Guid id);
    Task<IReadOnlyList<CurrencyDenominationDto>?> ReorderDenominationsAsync(Guid gameId, ReorderCurrencyDenominationsDto input);
    Task<IReadOnlyList<CharacterCurrencyDto>?> GetCharacterWalletAsync(Guid gameId, Guid characterId);
    Task<CharacterCurrencyDto?> SetCharacterCurrencyAsync(Guid gameId, Guid characterId, Guid denominationId, SetCharacterCurrencyDto input);
}
