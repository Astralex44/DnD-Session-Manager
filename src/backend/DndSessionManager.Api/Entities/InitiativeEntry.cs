namespace DndSessionManager.Api.Entities;

// FA-04 Initiative Tracker. Deliberately no HP/status field — the spec's own
// Nicht-Ziele calls this out explicitly ("Initiative ohne HP/Status — läuft
// über private Notizen"), so HP tracking during combat stays out of scope
// here and lives in each person's own Notes instead.
public class InitiativeEntry
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
    public bool IsMonster { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Game? Game { get; set; }
}
