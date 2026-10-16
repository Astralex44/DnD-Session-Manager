using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/access")]
[Authorize(Policy = GamePolicies.Dm)]
public class GameAccessListController(IGameAccessListFacade accessListFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<GameAccessListDto>> Get(Guid gameId) =>
        Ok(await accessListFacade.GetAccessListAsync(gameId));

    [HttpPost("invites")]
    public async Task<ActionResult<GameInviteDto>> AddInvite(Guid gameId, CreateGameInviteDto input)
    {
        var invite = await accessListFacade.AddInviteAsync(gameId, input);
        return invite is null ? Conflict() : Ok(invite);
    }

    [HttpDelete("invites/{inviteId:guid}")]
    public async Task<IActionResult> RemoveInvite(Guid gameId, Guid inviteId) =>
        await accessListFacade.RemoveInviteAsync(gameId, inviteId) ? NoContent() : NotFound();

    [HttpDelete("members/{memberId:guid}")]
    public async Task<IActionResult> RemoveMember(Guid gameId, Guid memberId) =>
        await accessListFacade.RemoveMemberAsync(gameId, memberId) ? NoContent() : NotFound();
}
