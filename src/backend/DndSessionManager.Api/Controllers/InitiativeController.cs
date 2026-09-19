using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/initiative")]
public class InitiativeController(IInitiativeFacade initiativeFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<InitiativeDto>> Get(Guid gameId) =>
        Ok(await initiativeFacade.GetInitiativeAsync(gameId));

    [HttpPost("entries")]
    public async Task<ActionResult<InitiativeDto>> AddEntry(Guid gameId, [FromBody] CreateInitiativeEntryDto input) =>
        Ok(await initiativeFacade.AddEntryAsync(gameId, input));

    [HttpDelete("entries/{entryId:guid}")]
    public async Task<ActionResult<InitiativeDto>> RemoveEntry(Guid gameId, Guid entryId) =>
        Ok(await initiativeFacade.RemoveEntryAsync(gameId, entryId));

    [HttpPost("next")]
    public async Task<ActionResult<InitiativeDto>> NextTurn(Guid gameId) =>
        Ok(await initiativeFacade.NextTurnAsync(gameId));

    [HttpPost("clear")]
    public async Task<ActionResult<InitiativeDto>> Clear(Guid gameId) =>
        Ok(await initiativeFacade.ClearAsync(gameId));
}
