using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IDocumentRepository : IRepository<Document>
{
    Task<IReadOnlyList<Document>> GetByGameIdAsync(Guid gameId);
}
