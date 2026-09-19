namespace DndSessionManager.Api.Dtos;

public record CurrencyDenominationDto(
    Guid Id,
    Guid GameId,
    string Name,
    string Abbreviation,
    string Color,
    int Value,
    int SortOrder);
