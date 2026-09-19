using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ISessionRepository : IRepository<Session>
{
    Task<IReadOnlyList<Session>> GetByGameIdAsync(Guid gameId);
}
