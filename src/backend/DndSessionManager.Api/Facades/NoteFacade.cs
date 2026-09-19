using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class NoteFacade(IUnitOfWork unitOfWork) : INoteFacade
{
    public async Task<IReadOnlyList<NoteDto>> GetNotesForOwnerAsync(Guid gameId, string ownerName) =>
        (await unitOfWork.Notes.GetByGameAndOwnerAsync(gameId, ownerName)).Select(ToDto).ToList();

    public async Task<NoteDto> CreateNoteAsync(Guid gameId, string ownerName, UpsertNoteDto input)
    {
        var now = DateTime.UtcNow;
        var note = new Note
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            OwnerName = ownerName,
            Title = input.Title.Trim(),
            Text = input.Text,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await unitOfWork.Notes.AddAsync(note);
        await unitOfWork.SaveChangesAsync();
        return ToDto(note);
    }

    public async Task<NoteDto?> UpdateNoteAsync(Guid gameId, string ownerName, Guid noteId, UpsertNoteDto input)
    {
        var note = await GetOwnedNoteAsync(gameId, ownerName, noteId);
        if (note is null) return null;

        note.Title = input.Title.Trim();
        note.Text = input.Text;
        note.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync();
        return ToDto(note);
    }

    public async Task<bool> DeleteNoteAsync(Guid gameId, string ownerName, Guid noteId)
    {
        var note = await GetOwnedNoteAsync(gameId, ownerName, noteId);
        if (note is null) return false;

        unitOfWork.Notes.Remove(note);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    private async Task<Note?> GetOwnedNoteAsync(Guid gameId, string ownerName, Guid noteId)
    {
        var note = await unitOfWork.Notes.GetByIdAsync(noteId);
        return note is not null && note.GameId == gameId && note.OwnerName == ownerName ? note : null;
    }

    private static NoteDto ToDto(Note note) =>
        new(note.Id, note.GameId, note.OwnerName, note.Title, note.Text, note.CreatedAt, note.UpdatedAt);
}
