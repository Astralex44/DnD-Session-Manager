using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/notes")]
public class NotesController(INoteFacade noteFacade, IAccessLockFacade accessLockFacade) : ControllerBase
{
    [HttpGet("{owner}")]
    public async Task<ActionResult<IReadOnlyList<NoteDto>>> GetAll(Guid gameId, string owner)
    {
        if (!await HasAccessAsync(gameId, owner)) return StatusCode(403);

        return Ok(await noteFacade.GetNotesForOwnerAsync(gameId, owner));
    }

    [HttpPost("{owner}")]
    public async Task<ActionResult<NoteDto>> Create(Guid gameId, string owner, [FromBody] UpsertNoteDto input)
    {
        if (!await HasAccessAsync(gameId, owner)) return StatusCode(403);

        return Ok(await noteFacade.CreateNoteAsync(gameId, owner, input));
    }

    [HttpPut("{owner}/{noteId:guid}")]
    public async Task<ActionResult<NoteDto>> Update(Guid gameId, string owner, Guid noteId, [FromBody] UpsertNoteDto input)
    {
        if (!await HasAccessAsync(gameId, owner)) return StatusCode(403);

        var note = await noteFacade.UpdateNoteAsync(gameId, owner, noteId, input);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpDelete("{owner}/{noteId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, string owner, Guid noteId)
    {
        if (!await HasAccessAsync(gameId, owner)) return StatusCode(403);

        return await noteFacade.DeleteNoteAsync(gameId, owner, noteId) ? NoContent() : NotFound();
    }

    // See CharactersController.HasAccessAsync — same temporary, simple lock
    // mechanism, keyed by the owner bucket name instead of a character id.
    private Task<bool> HasAccessAsync(Guid gameId, string owner) =>
        accessLockFacade.VerifyCodeAsync(gameId, "NotesOwner", owner, Request.Headers["X-Access-Code"]);
}
