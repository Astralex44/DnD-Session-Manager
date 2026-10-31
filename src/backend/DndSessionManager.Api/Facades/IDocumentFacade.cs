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

    // DM, "share with everyone": every character in the game sees the
    // document — missing shares are added, hidden ones shown again, locks
    // kept. One save, one broadcast. False = document not found.
    Task<bool> ShareWithAllAsync(Guid gameId, Guid documentId);

    // DM, "unshare all": removes every share of the document.
    Task<bool> RemoveAllSharesAsync(Guid gameId, Guid documentId);

    // FA-01 "after a session, maps are hidden for players unless they locked
    // them": an explicit DM action, not a session-live flag (the Board stays
    // a cockpit, not a gate). Hides every unlocked share of every Map in the
    // game; shares stay, so players can unhide. Returns how many it hid.
    Task<int> EndSessionAsync(Guid gameId);
}
