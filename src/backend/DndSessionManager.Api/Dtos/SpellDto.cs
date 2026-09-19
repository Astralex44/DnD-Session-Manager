namespace DndSessionManager.Api.Dtos;

public record SpellDto(Guid Id, int Level, string Name, bool Prepared, string? Description, bool IsHomebrew);
