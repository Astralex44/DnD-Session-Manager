namespace DndSessionManager.Api.Entities;

// Temporary, deliberately simple stand-in for real auth (see wiki's NFA-05 —
// Discord OAuth is still not built). Lets a player set their own short code
// to discourage casual snooping/editing by others at the table; not meant
// to resist a determined attacker (no rate limiting, no recovery flow — if
// someone forgets their code, the DM clears the row directly). ResourceType
// + ResourceKey is a generic (kind, id) pair so both Characters and Notes
// owner-buckets can reuse the same table instead of two near-identical ones.
public class AccessLock
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string ResourceType { get; set; } = string.Empty;
    public string ResourceKey { get; set; } = string.Empty;
    public string CodeHash { get; set; } = string.Empty;
    public string CodeSalt { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public Game? Game { get; set; }
}
