using System.Security.Claims;
using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Auth;

// What goes into the auth cookie — shared by the real Discord login and the
// Development-only test login so both produce identical sessions. Only the
// user ID is authoritative; the role is read fresh from the database on every
// request (see GameAccess), the claim is just informational.
public static class AuthClaims
{
    // Set on a Discord login that passed OAuth but isn't allowed into the
    // game; OnTicketReceived turns it into a "not invited" redirect instead
    // of a session.
    public const string NotInvited = "not_invited";

    public static IEnumerable<Claim> For(User user, GameMember membership) =>
    [
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim("discord_id", user.DiscordId),
        new Claim("role", membership.Role.ToString()),
    ];
}
