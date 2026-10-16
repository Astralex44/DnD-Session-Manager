namespace DndSessionManager.Api.Dtos;

// AboutCharacterId is set on the DM's notebook pages about a player character.
public record NoteDto(Guid Id, Guid GameId, Guid? AboutCharacterId, string Title, string Text, DateTime CreatedAt, DateTime UpdatedAt);
