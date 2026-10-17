namespace DndSessionManager.Api.Entities;

// FA-06 / NFA-03: one entry in a person's dice history. Always private — only
// UserId ever reads it back (the DM included: a roll the DM enters for a
// player lands in the player's history, the DM can't list it afterwards).
// Kept to the last 5 per person per game (deliberate non-goal: no longer
// history). Physical = a real-dice result typed in (hybrid play) rather than
// rolled by the app; EnteredByUserId says who typed it.
public class DiceRoll
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid UserId { get; set; }
    public Guid EnteredByUserId { get; set; }

    // "2d6+3" for an app roll; free text ("Perception", "2d6+3") for a physical one.
    public string Expression { get; set; } = string.Empty;

    // The individual dice for an app roll ("4,2"); empty for a physical one.
    public string Dice { get; set; } = string.Empty;
    public int Total { get; set; }
    public bool IsPhysical { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Game? Game { get; set; }
}
