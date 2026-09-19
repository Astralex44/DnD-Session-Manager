using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/sessions")]
public class SessionsController(ISessionFacade sessionFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionDto>>> GetAll(Guid gameId) =>
        Ok(await sessionFacade.GetSessionsForGameAsync(gameId));

    [HttpPost]
    public async Task<ActionResult<SessionDto>> Create(Guid gameId, [FromBody] UpsertSessionDto input) =>
        Ok(await sessionFacade.CreateSessionAsync(gameId, input));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SessionDto>> Update(Guid gameId, Guid id, [FromBody] UpsertSessionDto input)
    {
        var session = await sessionFacade.UpdateSessionAsync(gameId, id, input);
        return session is null ? NotFound() : Ok(session);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await sessionFacade.DeleteSessionAsync(gameId, id) ? NoContent() : NotFound();
}
