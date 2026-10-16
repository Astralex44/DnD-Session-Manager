using DndSessionManager.Api.Entities;
using Microsoft.AspNetCore.Authorization;

namespace DndSessionManager.Api.Auth;

// Two policies cover every game-scoped endpoint (all routed under
// api/games/{gameId}/...): GameMember for anything a player may do, GameDm
// for setup and live-session control. Put GameMember on the controller and
// GameDm on the DM-only actions — both must pass when both are present.
public static class GamePolicies
{
    public const string Member = "GameMember";
    public const string Dm = "GameDm";

    public static void Add(AuthorizationOptions options)
    {
        options.AddPolicy(Member, policy => policy
            .RequireAuthenticatedUser()
            .AddRequirements(new GameRoleRequirement(DmOnly: false)));
        options.AddPolicy(Dm, policy => policy
            .RequireAuthenticatedUser()
            .AddRequirements(new GameRoleRequirement(DmOnly: true)));
    }
}

public record GameRoleRequirement(bool DmOnly) : IAuthorizationRequirement;

public class GameRoleHandler(IGameAccess gameAccess, IHttpContextAccessor httpContextAccessor)
    : AuthorizationHandler<GameRoleRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, GameRoleRequirement requirement)
    {
        var httpContext = httpContextAccessor.HttpContext;
        var routeGameId = httpContext?.GetRouteValue("gameId")?.ToString();
        if (httpContext is null || !Guid.TryParse(routeGameId, out var gameId)) return;

        var role = await gameAccess.GetRoleAsync(context.User, gameId);
        if (role is null) return;
        if (requirement.DmOnly && role != GameMemberRole.Dm) return;

        httpContext.SetGameCaller(new GameCaller(GameAccess.GetUserId(context.User)!.Value, role.Value));
        context.Succeed(requirement);
    }
}
