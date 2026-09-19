namespace DndSessionManager.Api.Dtos;

public record RemoveLevelSheetResultDto(bool Success, string? Error, CharacterDetailDto? Character);
