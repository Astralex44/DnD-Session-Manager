namespace DndSessionManager.Api.Entities;

// Minimal for now — only what the Quote slice needs (FK target).
// Full GAME entity (per the ERD) gets fleshed out when its own slice is built.
public class Game
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Quote> Quotes { get; set; } = new List<Quote>();
}
