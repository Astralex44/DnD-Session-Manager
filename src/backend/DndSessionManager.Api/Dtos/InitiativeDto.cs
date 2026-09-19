namespace DndSessionManager.Api.Dtos;

public record InitiativeDto(int Round, IReadOnlyList<InitiativeEntryDto> Entries);
