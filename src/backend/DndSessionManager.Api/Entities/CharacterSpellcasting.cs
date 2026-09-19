namespace DndSessionManager.Api.Entities;

public class CharacterSpellcasting
{
    public Guid Id { get; set; }
    public Guid LevelSheetId { get; set; }
    public string Class { get; set; } = string.Empty;
    public string Ability { get; set; } = string.Empty;
    public int SpellSaveDc { get; set; }
    public int SpellAttackBonus { get; set; }
    public CharacterLevelSheet? LevelSheet { get; set; }
}
