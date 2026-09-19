using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpdateCharacterDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(100)] public string Race { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Class { get; set; } = string.Empty;
    public string Background { get; set; } = string.Empty;
    public string Alignment { get; set; } = string.Empty;
    [MaxLength(200)] public string PlayerName { get; set; } = string.Empty;
    public int ExperiencePoints { get; set; }
    [Range(1, 30)] public int Strength { get; set; } = 10;
    [Range(1, 30)] public int Dexterity { get; set; } = 10;
    [Range(1, 30)] public int Constitution { get; set; } = 10;
    [Range(1, 30)] public int Intelligence { get; set; } = 10;
    [Range(1, 30)] public int Wisdom { get; set; } = 10;
    [Range(1, 30)] public int Charisma { get; set; } = 10;
    public bool Inspiration { get; set; }
    [Range(0, 99)] public int ArmorClass { get; set; }
    public int Initiative { get; set; }
    [Range(0, 999)] public int Speed { get; set; }
    public int HpCurrent { get; set; }
    public int HpTemporary { get; set; }
    public string HitDiceTotal { get; set; } = string.Empty;
    [Range(0, 3)] public int DeathSaveSuccesses { get; set; }
    [Range(0, 3)] public int DeathSaveFailures { get; set; }
    public int PassivePerception { get; set; }
    public string OtherProficiencies { get; set; } = string.Empty;
    public string PersonalityTraits { get; set; } = string.Empty;
    public string Ideals { get; set; } = string.Empty;
    public string Bonds { get; set; } = string.Empty;
    public string Flaws { get; set; } = string.Empty;
    public string Backstory { get; set; } = string.Empty;
    public string Appearance { get; set; } = string.Empty;
    public string Age { get; set; } = string.Empty;
    public string Height { get; set; } = string.Empty;
    public string Weight { get; set; } = string.Empty;
    public string Eyes { get; set; } = string.Empty;
    public string Skin { get; set; } = string.Empty;
    public string Hair { get; set; } = string.Empty;
    public string AlliesOrganizations { get; set; } = string.Empty;
    public string AdditionalFeatures { get; set; } = string.Empty;
    public string FeaturesTraits { get; set; } = string.Empty;
    public string Treasure { get; set; } = string.Empty;
    [Required, MaxLength(30)] public string Status { get; set; } = "active";
}
