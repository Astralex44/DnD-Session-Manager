using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IGameTimerFacade
{
    // A player only gets timers for everyone or for one of their characters.
    Task<IReadOnlyList<GameTimerDto>> GetTimersForGameAsync(Guid gameId, GameCaller caller);

    // Null when a target character isn't in this game.
    Task<GameTimerDto?> CreateTimerAsync(Guid gameId, CreateGameTimerDto input);
    Task<bool> DeleteTimerAsync(Guid gameId, Guid timerId);
}
