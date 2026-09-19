namespace DndSessionManager.Api.Dtos;

public record LevelSheetDetailDto(
    Guid Id,
    int Level,
    int HpMax,
    int ProficiencyBonus,
    DateTime CreatedAt,
    SpellcastingDto? Spellcasting,
    IReadOnlyList<SpellDto> Spells,
    IReadOnlyList<SpellSlotDto> SpellSlots);
