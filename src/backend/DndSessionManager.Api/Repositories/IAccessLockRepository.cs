using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IAccessLockRepository : IRepository<AccessLock>
{
    Task<AccessLock?> GetByResourceAsync(Guid gameId, string resourceType, string resourceKey);
    Task<IReadOnlyList<AccessLock>> GetByGameAndTypeAsync(Guid gameId, string resourceType);
}
