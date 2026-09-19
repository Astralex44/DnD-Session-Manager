using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/quotes")]
public class QuotesController : ControllerBase
{
    private readonly IQuoteFacade _quoteFacade;

    public QuotesController(IQuoteFacade quoteFacade)
    {
        _quoteFacade = quoteFacade;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<QuoteDto>>> GetAll(Guid gameId)
    {
        var quotes = await _quoteFacade.GetQuotesForGameAsync(gameId);
        return Ok(quotes);
    }

    [HttpPost]
    public async Task<ActionResult<QuoteDto>> Create(Guid gameId, [FromBody] CreateQuoteDto input)
    {
        var quote = await _quoteFacade.CreateQuoteAsync(gameId, input);
        return CreatedAtAction(nameof(GetAll), new { gameId }, quote);
    }

    [HttpPatch("{quoteId:guid}/toggle-shared")]
    public async Task<ActionResult<QuoteDto>> ToggleShared(Guid gameId, Guid quoteId)
    {
        var quote = await _quoteFacade.ToggleSharedAsync(gameId, quoteId);
        return quote is null ? NotFound() : Ok(quote);
    }

    [HttpPatch("{quoteId:guid}/session")]
    public async Task<ActionResult<QuoteDto>> SetSession(Guid gameId, Guid quoteId, [FromBody] SetQuoteSessionDto input)
    {
        var quote = await _quoteFacade.SetSessionAsync(gameId, quoteId, input.SessionId);
        return quote is null ? NotFound() : Ok(quote);
    }

    [HttpPatch("{quoteId:guid}/character")]
    public async Task<ActionResult<QuoteDto>> SetCharacter(Guid gameId, Guid quoteId, [FromBody] SetQuoteCharacterDto input)
    {
        var quote = await _quoteFacade.SetCharacterAsync(gameId, quoteId, input.CharacterId);
        return quote is null ? NotFound() : Ok(quote);
    }

    [HttpDelete("{quoteId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid quoteId)
    {
        var deleted = await _quoteFacade.DeleteQuoteAsync(gameId, quoteId);
        return deleted ? NoContent() : NotFound();
    }
}
