using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IGameTimerRepository : IRepository<GameTimer>
{
    Task<IReadOnlyList<GameTimer>> GetByGameIdAsync(Guid gameId);
}
