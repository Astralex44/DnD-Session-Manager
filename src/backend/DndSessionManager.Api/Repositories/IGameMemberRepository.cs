using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IGameMemberRepository : IRepository<GameMember>
{
    Task<GameMember?> GetByGameAndUserAsync(Guid gameId, Guid userId);
    Task<IReadOnlyList<GameMember>> GetByGameIdAsync(Guid gameId);
}
