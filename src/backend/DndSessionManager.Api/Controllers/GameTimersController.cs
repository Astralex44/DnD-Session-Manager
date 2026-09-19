using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/timers")]
public class GameTimersController(IGameTimerFacade gameTimerFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GameTimerDto>>> GetAll(Guid gameId) =>
        Ok(await gameTimerFacade.GetTimersForGameAsync(gameId));

    [HttpPost]
    public async Task<ActionResult<GameTimerDto>> Create(Guid gameId, [FromBody] CreateGameTimerDto input) =>
        Ok(await gameTimerFacade.CreateTimerAsync(gameId, input));

    [HttpDelete("{timerId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid timerId) =>
        await gameTimerFacade.DeleteTimerAsync(gameId, timerId) ? NoContent() : NotFound();
}
