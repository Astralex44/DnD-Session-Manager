namespace DndSessionManager.Api.Entities;

public class CharacterSpellSlot
{
    public Guid Id { get; set; }
    public Guid LevelSheetId { get; set; }
    public int Level { get; set; }
    public int Total { get; set; }
    public int Expended { get; set; }
    public CharacterLevelSheet? LevelSheet { get; set; }
}
