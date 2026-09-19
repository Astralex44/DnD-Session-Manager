using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpsertSpellcastingDto
{
    [Required, MaxLength(100)] public string Class { get; set; } = string.Empty;
    [Required, MaxLength(20)] public string Ability { get; set; } = string.Empty;
    [Range(0, 99)] public int SpellSaveDc { get; set; }
    [Range(-99, 99)] public int SpellAttackBonus { get; set; }
}
