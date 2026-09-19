using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IMonsterRepository : IRepository<Monster>
{
    Task<IReadOnlyList<Monster>> GetByGameIdAsync(Guid gameId);
}
