namespace DndSessionManager.Api.Dtos;

public record QuoteDto(
    Guid Id,
    Guid GameId,
    string Text,
    bool IsShared,
    DateTime CreatedAt,
    Guid? SessionId,
    int? SessionNumber,
    Guid? CharacterId,
    string? CharacterName,
    string? PlayerName);
