using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/notes")]
public class NotesController(INoteFacade noteFacade) : ControllerBase
{
    [HttpGet("{owner}")]
    public async Task<ActionResult<IReadOnlyList<NoteDto>>> GetAll(Guid gameId, string owner) =>
        Ok(await noteFacade.GetNotesForOwnerAsync(gameId, owner));

    [HttpPost("{owner}")]
    public async Task<ActionResult<NoteDto>> Create(Guid gameId, string owner, [FromBody] UpsertNoteDto input) =>
        Ok(await noteFacade.CreateNoteAsync(gameId, owner, input));

    [HttpPut("{owner}/{noteId:guid}")]
    public async Task<ActionResult<NoteDto>> Update(Guid gameId, string owner, Guid noteId, [FromBody] UpsertNoteDto input)
    {
        var note = await noteFacade.UpdateNoteAsync(gameId, owner, noteId, input);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpDelete("{owner}/{noteId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, string owner, Guid noteId) =>
        await noteFacade.DeleteNoteAsync(gameId, owner, noteId) ? NoContent() : NotFound();
}
