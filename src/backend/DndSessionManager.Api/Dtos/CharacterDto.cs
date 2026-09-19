namespace DndSessionManager.Api.Dtos;

public record CharacterDto(
    Guid Id,
    Guid GameId,
    string Name,
    string Race,
    string Class,
    string PlayerName,
    string Status,
    int HpCurrent,
    int? HpMax,
    int ArmorClass,
    Guid? ActiveLevelSheetId,
    int? Level);
