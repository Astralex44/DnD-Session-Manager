using Microsoft.AspNetCore.SignalR;

namespace DndSessionManager.Api.Hubs;

// One hub for the whole app — clients join a group per game (no per-entity
// hubs needed) since every Board widget already scopes its data by GameId.
// No auth yet, so joining is just "which game am I looking at," the same
// demo-mode convention used everywhere else pre-Login.
public class GameHub : Hub
{
    public Task JoinGame(string gameId) => Groups.AddToGroupAsync(Context.ConnectionId, GroupName(Guid.Parse(gameId)));

    public static string GroupName(Guid gameId) => $"game-{gameId}";
}
