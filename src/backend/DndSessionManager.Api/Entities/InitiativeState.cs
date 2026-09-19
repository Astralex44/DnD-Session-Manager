namespace DndSessionManager.Api.Entities;

// One row per game — just tracks the current combat's round number. Separate
// from InitiativeEntry because it's really a property of "the current fight,"
// not of any one entry.
public class InitiativeState
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public int Round { get; set; } = 1;
    public Game? Game { get; set; }
}
