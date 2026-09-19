using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IShopRepository : IRepository<Shop>
{
    Task<IReadOnlyList<Shop>> GetByGameIdAsync(Guid gameId);
}
