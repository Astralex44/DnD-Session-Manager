using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IGameInviteRepository : IRepository<GameInvite>
{
    Task<IReadOnlyList<GameInvite>> GetByGameIdAsync(Guid gameId);
    Task<GameInvite?> GetByGameAndHandleAsync(Guid gameId, string discordHandle);
}
