using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IDocumentFacade
{
    // The DM gets everything. A player gets only documents shared with one of
    // their own characters, and only their own characters' share rows.
    Task<IReadOnlyList<DocumentDto>> GetDocumentsForGameAsync(Guid gameId, GameCaller caller);
    Task<DocumentDto?> GetDocumentAsync(Guid gameId, Guid documentId, GameCaller caller);
    Task<DocumentDto> CreateDocumentAsync(Guid gameId, CreateDocumentDto input);
    Task<DocumentDto?> UpdateDocumentAsync(Guid gameId, Guid documentId, UpdateDocumentDto input);
    Task<bool> DeleteDocumentAsync(Guid gameId, Guid documentId);

    // DM: any share. Player: Hide/Lock on an existing share of their own
    // character, or hand a document one of their characters holds to another
    // character (additive sharing, see Entities/DocumentShare.cs) — the new
    // share starts visible and unlocked, and the giver can't change it after.
    // Forbidden = the caller may not do this; Share null + !Forbidden = not found.
    Task<(DocumentShareDto? Share, bool Forbidden)> SetShareAsync(Guid gameId, Guid documentId, Guid characterId, UpsertDocumentShareDto input, GameCaller caller);
    Task<bool> RemoveShareAsync(Guid gameId, Guid documentId, Guid characterId);
}
