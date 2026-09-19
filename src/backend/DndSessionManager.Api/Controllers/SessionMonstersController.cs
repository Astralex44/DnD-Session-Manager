using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/session-monsters")]
public class SessionMonstersController(ISessionMonsterFacade sessionMonsterFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SessionMonsterDto>>> GetAll(Guid gameId) =>
        Ok(await sessionMonsterFacade.GetForGameAsync(gameId));

    [HttpPost]
    public async Task<ActionResult<SessionMonsterDto>> Add(Guid gameId, [FromBody] CreateSessionMonsterDto input)
    {
        var monster = await sessionMonsterFacade.AddAsync(gameId, input);
        return monster is null ? BadRequest() : Ok(monster);
    }

    [HttpPatch("{id:guid}/hp")]
    public async Task<ActionResult<SessionMonsterDto>> UpdateHp(Guid gameId, Guid id, [FromBody] UpdateSessionMonsterHpDto input)
    {
        var monster = await sessionMonsterFacade.UpdateHpAsync(gameId, id, input);
        return monster is null ? NotFound() : Ok(monster);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remove(Guid gameId, Guid id) =>
        await sessionMonsterFacade.RemoveAsync(gameId, id) ? NoContent() : NotFound();

    [HttpPost("clear")]
    public async Task<IActionResult> Clear(Guid gameId)
    {
        await sessionMonsterFacade.ClearAsync(gameId);
        return NoContent();
    }
}
