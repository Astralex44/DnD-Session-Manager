using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/currency-denominations")]
public class CurrencyController(ICurrencyFacade currencyFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CurrencyDenominationDto>>> GetAll(Guid gameId) =>
        Ok(await currencyFacade.GetDenominationsForGameAsync(gameId));

    [HttpPost]
    public async Task<ActionResult<CurrencyDenominationDto>> Create(Guid gameId, [FromBody] UpsertCurrencyDenominationDto input) =>
        Ok(await currencyFacade.CreateDenominationAsync(gameId, input));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CurrencyDenominationDto>> Update(Guid gameId, Guid id, [FromBody] UpsertCurrencyDenominationDto input)
    {
        var denomination = await currencyFacade.UpdateDenominationAsync(gameId, id, input);
        return denomination is null ? NotFound() : Ok(denomination);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await currencyFacade.DeleteDenominationAsync(gameId, id) ? NoContent() : NotFound();

    [HttpPut("reorder")]
    public async Task<ActionResult<IReadOnlyList<CurrencyDenominationDto>>> Reorder(Guid gameId, [FromBody] ReorderCurrencyDenominationsDto input)
    {
        var reordered = await currencyFacade.ReorderDenominationsAsync(gameId, input);
        return reordered is null ? BadRequest() : Ok(reordered);
    }
}
