namespace DndSessionManager.Api.Entities;

// The first person to log into a game becomes Dm automatically (see
// AuthFacade.FindOrCreateUserAsync); everyone after defaults to Player.
// No UI to change a member's role yet — that's real GameMember management,
// explicitly deferred (see the repo's Entscheidungs-Log) until multi-game
// support itself is built.
public class GameMember
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid UserId { get; set; }
    public GameMemberRole Role { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Game? Game { get; set; }
    public User? User { get; set; }
}
