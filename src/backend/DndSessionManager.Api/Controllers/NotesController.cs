using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

// Always the caller's own notes — whose notebook is decided by the login, not
// by anything in the URL. ?aboutCharacterId= picks the DM's notebook on one
// player character (DM only; 403 for anyone else).
[ApiController]
[Route("api/games/{gameId:guid}/notes")]
[Authorize(Policy = GamePolicies.Member)]
public class NotesController(INoteFacade noteFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NoteDto>>> GetAll(Guid gameId, [FromQuery] Guid? aboutCharacterId)
    {
        var notes = await noteFacade.GetNotesAsync(gameId, HttpContext.GetGameCaller(), aboutCharacterId);
        return notes is null ? Forbid() : Ok(notes);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(Guid gameId, [FromQuery] Guid? aboutCharacterId, [FromBody] UpsertNoteDto input)
    {
        var note = await noteFacade.CreateNoteAsync(gameId, HttpContext.GetGameCaller(), aboutCharacterId, input);
        return note is null ? Forbid() : Ok(note);
    }

    [HttpPut("{noteId:guid}")]
    public async Task<ActionResult<NoteDto>> Update(Guid gameId, Guid noteId, [FromBody] UpsertNoteDto input)
    {
        var note = await noteFacade.UpdateNoteAsync(gameId, HttpContext.GetGameCaller(), noteId, input);
        return note is null ? NotFound() : Ok(note);
    }

    [HttpDelete("{noteId:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid noteId) =>
        await noteFacade.DeleteNoteAsync(gameId, HttpContext.GetGameCaller(), noteId) ? NoContent() : NotFound();
}
