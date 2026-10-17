using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

// Always the caller's own dice — whose history is decided by the login.
[ApiController]
[Route("api/games/{gameId:guid}/dice")]
[Authorize(Policy = GamePolicies.Member)]
public class DiceController(IDiceFacade diceFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DiceRollDto>>> GetHistory(Guid gameId) =>
        Ok(await diceFacade.GetHistoryAsync(gameId, HttpContext.GetGameCaller()));

    [HttpPost("roll")]
    public async Task<ActionResult<DiceRollDto>> Roll(Guid gameId, RollDiceDto input)
    {
        var roll = await diceFacade.RollAsync(gameId, HttpContext.GetGameCaller(), input);
        return roll is null ? BadRequest() : Ok(roll);
    }

    [HttpPost("physical")]
    public async Task<ActionResult<DiceRollDto>> RecordPhysical(Guid gameId, RecordPhysicalRollDto input)
    {
        var (roll, forbidden) = await diceFacade.RecordPhysicalAsync(gameId, HttpContext.GetGameCaller(), input);
        if (forbidden) return Forbid();
        return Ok(roll);
    }
}
