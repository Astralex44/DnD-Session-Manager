using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface INoteRepository : IRepository<Note>
{
    Task<IReadOnlyList<Note>> GetByGameAndOwnerAsync(Guid gameId, string ownerName);
}
