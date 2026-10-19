namespace DndSessionManager.Api.Entities;

// Template separate from the live combatant (see wiki/Decision-Log.md "Monsters:
// template separate from the live combatant"): this is a reusable template
// (name, PDF stat block, default HP), owned by the DM, spanning the whole game.
// The live, HP-tracking copy of a monster on the Board is SessionMonster.
public class Monster
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public int DefaultHp { get; set; }
    public DateTime UploadedAt { get; set; }
    public Game? Game { get; set; }
}
