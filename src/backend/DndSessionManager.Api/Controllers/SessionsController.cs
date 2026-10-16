using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/sessions")]
[Authorize(Policy = GamePolicies.Member)]
public class SessionsController(ISessionFacade sessionFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionDto>>> GetAll(Guid gameId) =>
        Ok(await sessionFacade.GetSessionsForGameAsync(gameId, HttpContext.GetGameCaller()));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create(Guid gameId, [FromBody] UpsertSessionDto input) =>
        Ok(await sessionFacade.CreateSessionAsync(gameId, input));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SessionDto>> Update(Guid gameId, Guid id, [FromBody] UpsertSessionDto input)
    {
        var session = await sessionFacade.UpdateSessionAsync(gameId, id, input);
        return session is null ? NotFound() : Ok(session);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await sessionFacade.DeleteSessionAsync(gameId, id) ? NoContent() : NotFound();
}
