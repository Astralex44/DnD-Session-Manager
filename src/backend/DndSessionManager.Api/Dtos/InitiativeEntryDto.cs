namespace DndSessionManager.Api.Dtos;

public record InitiativeEntryDto(Guid Id, string Name, int Value, bool IsMonster, bool IsActive);
