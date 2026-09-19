using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface INoteFacade
{
    Task<IReadOnlyList<NoteDto>> GetNotesForOwnerAsync(Guid gameId, string ownerName);
    Task<NoteDto> CreateNoteAsync(Guid gameId, string ownerName, UpsertNoteDto input);
    Task<NoteDto?> UpdateNoteAsync(Guid gameId, string ownerName, Guid noteId, UpsertNoteDto input);
    Task<bool> DeleteNoteAsync(Guid gameId, string ownerName, Guid noteId);
}
