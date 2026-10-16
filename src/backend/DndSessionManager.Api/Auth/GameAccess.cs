using System.Security.Claims;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Auth;

// The single answer to "what is this caller in this game?" — used by the
// GameMember/GameDm policies, the file endpoints and the SignalR hub, so all
// three agree. Reads the membership from the database on every call instead
// of trusting the role claim baked into the cookie at login, so a role change
// or a removed member takes effect immediately, not at the next login.
public interface IGameAccess
{
    Task<GameMemberRole?> GetRoleAsync(ClaimsPrincipal user, Guid gameId);
}

public class GameAccess(IGameMemberRepository gameMembers) : IGameAccess
{
    public async Task<GameMemberRole?> GetRoleAsync(ClaimsPrincipal user, Guid gameId)
    {
        var userId = GetUserId(user);
        if (userId is null) return null;

        var membership = await gameMembers.GetByGameAndUserAsync(gameId, userId.Value);
        return membership?.Role;
    }

    public static Guid? GetUserId(ClaimsPrincipal user) =>
        Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : null;
}
