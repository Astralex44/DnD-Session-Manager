namespace DndSessionManager.Api.Entities;

public class Session
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }

    // Auto-assigned on creation (max existing Number for the game + 1) — stays
    // stable even if an earlier session is later deleted, matching a real
    // session log where "Session 12" doesn't get renumbered.
    public int Number { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime? ScheduledAt { get; set; }
    public string Notes { get; set; } = string.Empty;
    public Game? Game { get; set; }
}
