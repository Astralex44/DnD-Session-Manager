namespace DndSessionManager.Api.Entities;

// Created at login (see AuthFacade.SignInAsync): Dm for the Discord ID in
// Auth:DmDiscordId, Player for anyone the DM invited (GameInvite). The DM can
// remove players from the access list; changing roles otherwise is real
// multi-game management, explicitly deferred (see the repo's Entscheidungs-Log).
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
