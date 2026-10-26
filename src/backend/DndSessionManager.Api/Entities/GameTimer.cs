namespace DndSessionManager.Api.Entities;

// FA-12 Timer, "multiple parallel". Named "GameTimer" (not "Timer") to avoid
// colliding with System.Threading.Timer. Countdown is computed from EndsAt
// rather than storing remaining seconds, so it's correct regardless of how
// long the client has had the page open or when it last polled.
public class GameTimer
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Label { get; set; } = string.Empty;
    public DateTime EndsAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public Game? Game { get; set; }

    // Who sees the timer. Empty = everyone at the table; otherwise only the
    // owners of these characters (and the DM, who always sees every timer).
    public ICollection<GameTimerTarget> Targets { get; set; } = new List<GameTimerTarget>();
}
