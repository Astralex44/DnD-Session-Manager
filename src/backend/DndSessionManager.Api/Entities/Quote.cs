namespace DndSessionManager.Api.Entities;

public class Quote
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Game? Game { get; set; }
    public string Text { get; set; } = string.Empty;
    public bool IsShared { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Nullable: a quote can be logged outside any specific session, or before
    // sessions existed at all.
    public Guid? SessionId { get; set; }
    public Session? Session { get; set; }

    // Nullable: who said it — not every quote is attributed (DM narration,
    // an NPC, or just unknown). Attribution is displayed as the player's
    // name (Character.PlayerName), not the character's, since a "quote" is
    // usually the real person's table talk rather than in-character dialog.
    public Guid? CharacterId { get; set; }
    public Character? Character { get; set; }
}
