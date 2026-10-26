namespace DndSessionManager.Api.Entities;

// A timer meant for one character only. Character-scoped like map and shop
// shares (see wiki/Decision-Log.md), not tied to the player account.
public class GameTimerTarget
{
    public Guid Id { get; set; }
    public Guid TimerId { get; set; }
    public Guid CharacterId { get; set; }
    public GameTimer? Timer { get; set; }
    public Character? Character { get; set; }
}
