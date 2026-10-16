using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface ISessionFacade
{
    // Players get number, title and date only — Notes is the DM's prep (FA-13).
    Task<IReadOnlyList<SessionDto>> GetSessionsForGameAsync(Guid gameId, GameCaller caller);
    Task<SessionDto> CreateSessionAsync(Guid gameId, UpsertSessionDto input);
    Task<SessionDto?> UpdateSessionAsync(Guid gameId, Guid sessionId, UpsertSessionDto input);
    Task<bool> DeleteSessionAsync(Guid gameId, Guid sessionId);
}
