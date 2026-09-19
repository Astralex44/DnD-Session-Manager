using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IInitiativeStateRepository : IRepository<InitiativeState>
{
    Task<InitiativeState?> GetByGameIdAsync(Guid gameId);
}
