namespace DndSessionManager.Api.Dtos;

// OwnerUserId/OwnerUsername tell the DM whose character this is (null until
// the DM assigns a pre-login character to an account).
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
    int? Level,
    Guid? OwnerUserId,
    string? OwnerUsername);
