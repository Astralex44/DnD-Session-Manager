using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IDiceRollRepository : IRepository<DiceRoll>
{
    // Newest first.
    Task<IReadOnlyList<DiceRoll>> GetByGameAndUserAsync(Guid gameId, Guid userId);
}
