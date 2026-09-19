using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ISessionMonsterRepository : IRepository<SessionMonster>
{
    Task<IReadOnlyList<SessionMonster>> GetByGameIdAsync(Guid gameId);
}
