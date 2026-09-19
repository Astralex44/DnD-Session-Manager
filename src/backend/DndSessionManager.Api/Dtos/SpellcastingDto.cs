namespace DndSessionManager.Api.Dtos;

public record SpellcastingDto(Guid Id, string Class, string Ability, int SpellSaveDc, int SpellAttackBonus);
