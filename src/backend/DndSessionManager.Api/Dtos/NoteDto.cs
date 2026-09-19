namespace DndSessionManager.Api.Dtos;

public record NoteDto(Guid Id, Guid GameId, string OwnerName, string Title, string Text, DateTime CreatedAt, DateTime UpdatedAt);
