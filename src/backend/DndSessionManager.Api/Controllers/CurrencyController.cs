using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/currency-denominations")]
[Authorize(Policy = GamePolicies.Member)]
public class CurrencyController(ICurrencyFacade currencyFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CurrencyDenominationDto>>> GetAll(Guid gameId) =>
        Ok(await currencyFacade.GetDenominationsForGameAsync(gameId));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPost]
    public async Task<ActionResult<CurrencyDenominationDto>> Create(Guid gameId, [FromBody] UpsertCurrencyDenominationDto input) =>
        Ok(await currencyFacade.CreateDenominationAsync(gameId, input));

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CurrencyDenominationDto>> Update(Guid gameId, Guid id, [FromBody] UpsertCurrencyDenominationDto input)
    {
        var denomination = await currencyFacade.UpdateDenominationAsync(gameId, id, input);
        return denomination is null ? NotFound() : Ok(denomination);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpGet("{id:guid}/usage")]
    public async Task<ActionResult<CurrencyUsageDto>> GetUsage(Guid gameId, Guid id)
    {
        var usage = await currencyFacade.GetUsageAsync(gameId, id);
        return usage is null ? NotFound() : Ok(usage);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id)
    {
        var (deleted, inUse) = await currencyFacade.DeleteDenominationAsync(gameId, id);
        if (inUse is not null) return Conflict(inUse);
        return deleted ? NoContent() : NotFound();
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPut("reorder")]
    public async Task<ActionResult<IReadOnlyList<CurrencyDenominationDto>>> Reorder(Guid gameId, [FromBody] ReorderCurrencyDenominationsDto input)
    {
        var reordered = await currencyFacade.ReorderDenominationsAsync(gameId, input);
        return reordered is null ? BadRequest() : Ok(reordered);
    }
}
