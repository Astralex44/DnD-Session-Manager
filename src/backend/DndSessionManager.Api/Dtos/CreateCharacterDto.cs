using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateCharacterDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(100)] public string Race { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Class { get; set; } = string.Empty;
    [MaxLength(200)] public string PlayerName { get; set; } = string.Empty;
    public string Background { get; set; } = string.Empty;
    public string Alignment { get; set; } = string.Empty;
    public int ExperiencePoints { get; set; }
    [Range(1, 20)] public int Level { get; set; } = 1;
    [Range(1, 999)] public int HpMax { get; set; } = 10;
    [Range(1, 99)] public int ArmorClass { get; set; } = 10;
    [Range(1, 99)] public int Speed { get; set; } = 30;
    [Range(1, 30)] public int Strength { get; set; } = 10;
    [Range(1, 30)] public int Dexterity { get; set; } = 10;
    [Range(1, 30)] public int Constitution { get; set; } = 10;
    [Range(1, 30)] public int Intelligence { get; set; } = 10;
    [Range(1, 30)] public int Wisdom { get; set; } = 10;
    [Range(1, 30)] public int Charisma { get; set; } = 10;
    [Range(1, 10)] public int ProficiencyBonus { get; set; } = 2;
}
