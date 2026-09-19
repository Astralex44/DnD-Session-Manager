using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IInitiativeEntryRepository : IRepository<InitiativeEntry>
{
    Task<IReadOnlyList<InitiativeEntry>> GetByGameIdAsync(Guid gameId);
}
