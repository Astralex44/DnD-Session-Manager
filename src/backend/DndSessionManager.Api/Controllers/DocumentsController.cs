using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/documents")]
[Authorize(Policy = GamePolicies.Member)]
public class DocumentsController(IDocumentFacade documentFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DocumentDto>>> GetAll(Guid gameId) =>
        Ok(await documentFacade.GetDocumentsForGameAsync(gameId, HttpContext.GetGameCaller()));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DocumentDto>> GetById(Guid gameId, Guid id)
    {
        var document = await documentFacade.GetDocumentAsync(gameId, id, HttpContext.GetGameCaller());
        return document is null ? NotFound() : Ok(document);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [RequestSizeLimit(UploadLimits.MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadLimits.MaxRequestBytes)]
    [HttpPost]
    public async Task<ActionResult<DocumentDto>> Create(Guid gameId, [FromForm] CreateDocumentDto input)
    {
        var document = await documentFacade.CreateDocumentAsync(gameId, input);
        return CreatedAtAction(nameof(GetById), new { gameId, id = document.Id }, document);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [RequestSizeLimit(UploadLimits.MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = UploadLimits.MaxRequestBytes)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DocumentDto>> Update(Guid gameId, Guid id, [FromForm] UpdateDocumentDto input)
    {
        var document = await documentFacade.UpdateDocumentAsync(gameId, id, input);
        return document is null ? NotFound() : Ok(document);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await documentFacade.DeleteDocumentAsync(gameId, id) ? NoContent() : NotFound();

    [HttpPut("{id:guid}/shares/{characterId:guid}")]
    public async Task<ActionResult<DocumentShareDto>> SetShare(Guid gameId, Guid id, Guid characterId, [FromBody] UpsertDocumentShareDto input)
    {
        var (share, forbidden) = await documentFacade.SetShareAsync(gameId, id, characterId, input, HttpContext.GetGameCaller());
        if (forbidden) return Forbid();
        return share is null ? NotFound() : Ok(share);
    }

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPost("end-session")]
    public async Task<ActionResult<object>> EndSession(Guid gameId) =>
        Ok(new { hidden = await documentFacade.EndSessionAsync(gameId) });

    [Authorize(Policy = GamePolicies.Dm)]
    [HttpDelete("{id:guid}/shares/{characterId:guid}")]
    public async Task<IActionResult> RemoveShare(Guid gameId, Guid id, Guid characterId) =>
        await documentFacade.RemoveShareAsync(gameId, id, characterId) ? NoContent() : NotFound();
}
