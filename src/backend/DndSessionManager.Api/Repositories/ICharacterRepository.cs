using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICharacterRepository : IRepository<Character>
{
    Task<IReadOnlyList<Character>> GetByGameIdAsync(Guid gameId);
}
