namespace DndSessionManager.Api.Hubs;

// Thin wrapper around IHubContext<GameHub> so facades depend on a plain
// interface rather than a SignalR-specific type (same reasoning as
// IDocumentFileStorage wrapping file I/O). One event name per resource area
// (e.g. "initiative", "shops") is broadcast with no payload — clients just
// refetch via the existing REST GET on receipt, so the hub never needs to
// duplicate any DTO shape.
public interface IGameEventsBroadcaster
{
    Task NotifyAsync(Guid gameId, string eventName);
}
