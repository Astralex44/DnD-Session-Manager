namespace DndSessionManager.Api.Entities;

public class CharacterSpell
{
    public Guid Id { get; set; }
    public Guid LevelSheetId { get; set; }
    public int Level { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool Prepared { get; set; }
    public string? Description { get; set; }
    public bool IsHomebrew { get; set; }
    public CharacterLevelSheet? LevelSheet { get; set; }
}
