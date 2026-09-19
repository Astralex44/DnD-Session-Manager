using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IInitiativeFacade
{
    Task<InitiativeDto> GetInitiativeAsync(Guid gameId);
    Task<InitiativeDto> AddEntryAsync(Guid gameId, CreateInitiativeEntryDto input);
    Task<InitiativeDto> RemoveEntryAsync(Guid gameId, Guid entryId);
    Task<InitiativeDto> NextTurnAsync(Guid gameId);
    Task<InitiativeDto> ClearAsync(Guid gameId);
}
