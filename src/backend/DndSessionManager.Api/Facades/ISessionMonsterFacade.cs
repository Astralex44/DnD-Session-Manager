using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface ISessionMonsterFacade
{
    Task<IReadOnlyList<SessionMonsterDto>> GetForGameAsync(Guid gameId);
    Task<SessionMonsterDto?> AddAsync(Guid gameId, CreateSessionMonsterDto input);
    Task<SessionMonsterDto?> UpdateHpAsync(Guid gameId, Guid id, UpdateSessionMonsterHpDto input);
    Task<bool> RemoveAsync(Guid gameId, Guid id);
    Task ClearAsync(Guid gameId);
}
