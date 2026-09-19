namespace DndSessionManager.Api.Dtos;

public record CharacterCurrencyDto(
    Guid DenominationId,
    string Name,
    string Abbreviation,
    string Color,
    int Quantity);
