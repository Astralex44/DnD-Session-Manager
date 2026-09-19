using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IGameTimerFacade
{
    Task<IReadOnlyList<GameTimerDto>> GetTimersForGameAsync(Guid gameId);
    Task<GameTimerDto> CreateTimerAsync(Guid gameId, CreateGameTimerDto input);
    Task<bool> DeleteTimerAsync(Guid gameId, Guid timerId);
}
