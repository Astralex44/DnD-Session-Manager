namespace DndSessionManager.Api.Entities;

// The DM's access list (NFA-05): a Discord username the DM has invited into
// the game. Matched against the unique Discord handle at login — a match
// turns into a Player GameMember and the invite is used up. Anyone without
// an invite (and who isn't the configured DM) never gets a membership.
public class GameInvite
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }

    // Stored normalized (trimmed, lowercase, no leading "@"), the same way
    // Discord itself treats usernames since the 2023 handle change.
    public string DiscordHandle { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Game? Game { get; set; }

    public static string NormalizeHandle(string handle) => handle.Trim().TrimStart('@').ToLowerInvariant();
}
