using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

// Every method acts on the caller's own notes only — there is no way to read
// someone else's, the DM included (FA-08). aboutCharacterId selects the DM's
// notebook on a character; for anyone but the DM it's refused (null/false).
public interface INoteFacade
{
    Task<IReadOnlyList<NoteDto>?> GetNotesAsync(Guid gameId, GameCaller caller, Guid? aboutCharacterId);
    Task<NoteDto?> CreateNoteAsync(Guid gameId, GameCaller caller, Guid? aboutCharacterId, UpsertNoteDto input);
    Task<NoteDto?> UpdateNoteAsync(Guid gameId, GameCaller caller, Guid noteId, UpsertNoteDto input);
    Task<bool> DeleteNoteAsync(Guid gameId, GameCaller caller, Guid noteId);

    // Hands pre-login notes from the free-text bucket ownerName to an account.
    // Only stages the change — the caller's SaveChangesAsync commits it, in
    // the same transaction as whatever triggered the adoption.
    Task AdoptLegacyNotesAsync(Guid gameId, string ownerName, Guid ownerUserId, Guid? aboutCharacterId);
}
