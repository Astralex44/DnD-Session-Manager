using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/timers")]
[Authorize(Policy = GamePolicies.Member)]
public class GameTimersController(IGameTimerFacade gameTimerFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<GameTimerDto>>> GetAll(Guid gameId) =>
        Ok(await gameTimerFacade.GetTimersForGameAsync(gameId));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPost]
    public async Task<ActionResult<GameTimerDto>> Create(Guid gameId, [FromBody] CreateGameTimerDto input) =>
        Ok(await gameTimerFacade.CreateTimerAsync(gameId, input));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpDelete("{timerId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid timerId) =>
        await gameTimerFacade.DeleteTimerAsync(gameId, timerId) ? NoContent() : NotFound();
}
