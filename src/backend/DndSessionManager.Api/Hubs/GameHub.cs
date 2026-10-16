using DndSessionManager.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace DndSessionManager.Api.Hubs;

// One hub for the whole app — clients join a group per game (no per-entity
// hubs needed) since every Board widget already scopes its data by GameId.
// Only logged-in members of a game may join its group; the events carry no
// payload anyway (listeners refetch through the guarded REST endpoints), but
// strangers shouldn't even learn when something changed.
[Authorize]
public class GameHub(IGameAccess gameAccess) : Hub
{
    public async Task JoinGame(string gameId)
    {
        if (!Guid.TryParse(gameId, out var id) || await gameAccess.GetRoleAsync(Context.User!, id) is null)
            throw new HubException("Not a member of this game.");

        await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(id));
    }

    public static string GroupName(Guid gameId) => $"game-{gameId}";
}
