namespace DndSessionManager.Api.Dtos;

// Race/Class/Status/HpCurrent/HpMax/ArmorClass/Level are blanked out (see
// CharacterFacade.ToDto) when Locked is true — Name/PlayerName stay so the
// overview list can still be navigated, but the AccessLock's whole point is
// that a locked character's actual info isn't visible without the code, not
// just that it can't be *edited*.
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
    bool Locked);
