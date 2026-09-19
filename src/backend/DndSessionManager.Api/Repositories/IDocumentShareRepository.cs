using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IDocumentShareRepository : IRepository<DocumentShare>
{
    Task<DocumentShare?> GetByDocumentAndCharacterAsync(Guid documentId, Guid characterId);
    Task<IReadOnlyList<DocumentShare>> GetByCharacterIdAsync(Guid characterId);
}
