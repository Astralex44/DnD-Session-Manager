using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IDocumentFacade
{
    Task<IReadOnlyList<DocumentDto>> GetDocumentsForGameAsync(Guid gameId);
    Task<DocumentDto?> GetDocumentAsync(Guid gameId, Guid documentId);
    Task<DocumentDto> CreateDocumentAsync(Guid gameId, CreateDocumentDto input);
    Task<DocumentDto?> UpdateDocumentAsync(Guid gameId, Guid documentId, UpdateDocumentDto input);
    Task<bool> DeleteDocumentAsync(Guid gameId, Guid documentId);

    // Open to any character already on the share list, not DM-only — see
    // Entities/DocumentShare.cs. There's no auth layer yet to actually
    // enforce that restriction, so it's really "open to anyone" today; the
    // API shape is what matters for when auth lands.
    Task<DocumentShareDto?> SetShareAsync(Guid gameId, Guid documentId, Guid characterId, UpsertDocumentShareDto input);
    Task<bool> RemoveShareAsync(Guid gameId, Guid documentId, Guid characterId);
}
