namespace DndSessionManager.Api.Entities;

public class Character
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Race { get; set; } = string.Empty;
    public string Class { get; set; } = string.Empty;
    public string Background { get; set; } = string.Empty;
    public string Alignment { get; set; } = string.Empty;
    public string PlayerName { get; set; } = string.Empty;
    public int ExperiencePoints { get; set; }
    public int Strength { get; set; } = 10;
    public int Dexterity { get; set; } = 10;
    public int Constitution { get; set; } = 10;
    public int Intelligence { get; set; } = 10;
    public int Wisdom { get; set; } = 10;
    public int Charisma { get; set; } = 10;
    public bool Inspiration { get; set; }
    public int ArmorClass { get; set; }
    public int Initiative { get; set; }
    public int Speed { get; set; }
    public int HpCurrent { get; set; }
    public int HpTemporary { get; set; }
    public string HitDiceTotal { get; set; } = string.Empty;
    public int DeathSaveSuccesses { get; set; }
    public int DeathSaveFailures { get; set; }
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
    public string Status { get; set; } = "active";
    public Guid? ActiveLevelSheetId { get; set; }
    public Game? Game { get; set; }
    public CharacterLevelSheet? ActiveLevelSheet { get; set; }
    public ICollection<CharacterLevelSheet> LevelSheets { get; set; } = new List<CharacterLevelSheet>();
    public ICollection<CharacterSkill> Skills { get; set; } = new List<CharacterSkill>();
    public ICollection<CharacterSave> Saves { get; set; } = new List<CharacterSave>();
    public ICollection<CharacterAttack> Attacks { get; set; } = new List<CharacterAttack>();
    public ICollection<CharacterItem> Items { get; set; } = new List<CharacterItem>();
    public ICollection<CharacterCurrency> Currencies { get; set; } = new List<CharacterCurrency>();
}
