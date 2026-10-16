using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class NoteFacade(IUnitOfWork unitOfWork) : INoteFacade
{
    public async Task<IReadOnlyList<NoteDto>?> GetNotesAsync(Guid gameId, GameCaller caller, Guid? aboutCharacterId)
    {
        if (!await MayUseNotebookAsync(gameId, caller, aboutCharacterId)) return null;
        return (await unitOfWork.Notes.GetByOwnerAsync(gameId, caller.UserId, aboutCharacterId)).Select(ToDto).ToList();
    }

    public async Task<NoteDto?> CreateNoteAsync(Guid gameId, GameCaller caller, Guid? aboutCharacterId, UpsertNoteDto input)
    {
        if (!await MayUseNotebookAsync(gameId, caller, aboutCharacterId)) return null;

        var owner = await unitOfWork.Users.GetByIdAsync(caller.UserId);
        var now = DateTime.UtcNow;
        var note = new Note
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            OwnerUserId = caller.UserId,
            AboutCharacterId = aboutCharacterId,
            OwnerName = owner?.Username ?? string.Empty,
            Title = input.Title.Trim(),
            Text = input.Text,
            CreatedAt = now,
            UpdatedAt = now,
        };

        await unitOfWork.Notes.AddAsync(note);
        await unitOfWork.SaveChangesAsync();
        return ToDto(note);
    }

    public async Task<NoteDto?> UpdateNoteAsync(Guid gameId, GameCaller caller, Guid noteId, UpsertNoteDto input)
    {
        var note = await GetOwnedNoteAsync(gameId, caller, noteId);
        if (note is null) return null;

        note.Title = input.Title.Trim();
        note.Text = input.Text;
        note.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync();
        return ToDto(note);
    }

    public async Task<bool> DeleteNoteAsync(Guid gameId, GameCaller caller, Guid noteId)
    {
        var note = await GetOwnedNoteAsync(gameId, caller, noteId);
        if (note is null) return false;

        unitOfWork.Notes.Remove(note);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task AdoptLegacyNotesAsync(Guid gameId, string ownerName, Guid ownerUserId, Guid? aboutCharacterId)
    {
        if (string.IsNullOrWhiteSpace(ownerName)) return;

        foreach (var note in await unitOfWork.Notes.GetUnclaimedByOwnerNameAsync(gameId, ownerName))
        {
            note.OwnerUserId = ownerUserId;
            note.AboutCharacterId = aboutCharacterId;
        }
    }

    // Own notebook: anyone. A notebook about a character: the DM only, and
    // only for a character of this game.
    private async Task<bool> MayUseNotebookAsync(Guid gameId, GameCaller caller, Guid? aboutCharacterId)
    {
        if (aboutCharacterId is null) return true;
        if (!caller.IsDm) return false;

        var character = await unitOfWork.Characters.GetByIdAsync(aboutCharacterId.Value);
        return character is not null && character.GameId == gameId;
    }

    private async Task<Note?> GetOwnedNoteAsync(Guid gameId, GameCaller caller, Guid noteId)
    {
        var note = await unitOfWork.Notes.GetByIdAsync(noteId);
        return note is not null && note.GameId == gameId && note.OwnerUserId == caller.UserId ? note : null;
    }

    private static NoteDto ToDto(Note note) =>
        new(note.Id, note.GameId, note.AboutCharacterId, note.Title, note.Text, note.CreatedAt, note.UpdatedAt);
}
