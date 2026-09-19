using Microsoft.AspNetCore.SignalR;

namespace DndSessionManager.Api.Hubs;

public class GameEventsBroadcaster(IHubContext<GameHub> hubContext) : IGameEventsBroadcaster
{
    public Task NotifyAsync(Guid gameId, string eventName) =>
        hubContext.Clients.Group(GameHub.GroupName(gameId)).SendAsync("gameEvent", eventName);
}
