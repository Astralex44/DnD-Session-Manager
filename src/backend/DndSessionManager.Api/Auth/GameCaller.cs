using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Auth;

// Who is making this request, in the game from the route. Resolved once by
// GameRoleHandler while checking the GameMember/GameDm policy and stashed on
// the request, so controllers can pass it to facades without a second
// membership lookup. Only available on endpoints behind one of those policies.
public record GameCaller(Guid UserId, GameMemberRole Role)
{
    public bool IsDm => Role == GameMemberRole.Dm;
}

public static class GameCallerExtensions
{
    private const string ItemKey = "GameCaller";

    public static void SetGameCaller(this HttpContext httpContext, GameCaller caller) =>
        httpContext.Items[ItemKey] = caller;

    public static GameCaller GetGameCaller(this HttpContext httpContext) =>
        httpContext.Items[ItemKey] as GameCaller
        ?? throw new InvalidOperationException("No GameCaller — the endpoint isn't behind a GamePolicies policy.");
}
