namespace DndSessionManager.Api.Entities;

public class User
{
    public Guid Id { get; set; }
    public string DiscordId { get; set; } = string.Empty;

    // The unique Discord username ("astralex") that invites match against.
    // Username below is the display name ("Astralex"), which isn't unique.
    public string DiscordHandle { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<GameMember> Memberships { get; set; } = new List<GameMember>();
}
