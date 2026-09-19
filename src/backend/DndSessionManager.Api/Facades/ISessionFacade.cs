using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface ISessionFacade
{
    Task<IReadOnlyList<SessionDto>> GetSessionsForGameAsync(Guid gameId);
    Task<SessionDto> CreateSessionAsync(Guid gameId, UpsertSessionDto input);
    Task<SessionDto?> UpdateSessionAsync(Guid gameId, Guid sessionId, UpsertSessionDto input);
    Task<bool> DeleteSessionAsync(Guid gameId, Guid sessionId);
}
