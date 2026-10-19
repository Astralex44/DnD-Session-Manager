using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace DndSessionManager.Api.Auth;

public enum CharacterAccess
{
    // Owner, or the DM (who sees every character, read-only).
    Read,

    // The owner only.
    Owner,
}

// Declares on each CharactersController action who may touch the character
// in the {id} route value, so the rule is visible next to the endpoint
// instead of buried in 25 facade methods. Runs after the GameMember policy,
// which already resolved the caller. Unknown character → 404 before any
// ownership check.
[AttributeUsage(AttributeTargets.Method)]
public class CharacterAccessAttribute(CharacterAccess access) : Attribute, IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var routeValues = context.RouteData.Values;
        if (!Guid.TryParse(routeValues["gameId"]?.ToString(), out var gameId) ||
            !Guid.TryParse(routeValues["id"]?.ToString(), out var characterId))
        {
            context.Result = new NotFoundResult();
            return;
        }

        var characterFacade = context.HttpContext.RequestServices.GetRequiredService<ICharacterFacade>();
        var (exists, ownerUserId) = await characterFacade.GetOwnerAsync(gameId, characterId);
        if (!exists)
        {
            context.Result = new NotFoundResult();
            return;
        }

        var caller = context.HttpContext.GetGameCaller();
        var isOwner = ownerUserId == caller.UserId;
        // The DM reads every character but never edits one that isn't theirs
        // (Severin, 2026-10-19 — replaces the old replacement-character
        // exception, see the repo's decision log).
        var allowed = access switch
        {
            CharacterAccess.Owner => isOwner,
            _ => isOwner || caller.IsDm,
        };

        if (!allowed)
        {
            context.Result = new ForbidResult();
            return;
        }

        await next();
    }
}
