using DndSessionManager.Api.Storage;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

// TODO(auth): open on purpose for now, no auth/session exists yet — gate this
// on the caller holding a non-hidden DocumentShare for the document once
// auth lands (Books that are DM-only reference material need their own rule
// since not every Document is meant to be shared).
[ApiController]
[Route("api/files/documents")]
public class FilesController(IDocumentFileStorage fileStorage) : ControllerBase
{
    [HttpGet("{fileName}")]
    public async Task<IActionResult> GetDocumentFile(string fileName)
    {
        var result = await fileStorage.OpenAsync(fileName);
        return result is null ? NotFound() : File(result.Value.Stream, result.Value.ContentType);
    }
}

// TODO(auth): same as FilesController above — open for now, gate on the
// caller being the DM once auth lands (monster stat blocks aren't shared
// with characters at all).
[ApiController]
[Route("api/files/monsters")]
public class MonsterFilesController(IMonsterFileStorage fileStorage) : ControllerBase
{
    [HttpGet("{fileName}")]
    public async Task<IActionResult> GetMonsterFile(string fileName)
    {
        var result = await fileStorage.OpenAsync(fileName);
        return result is null ? NotFound() : File(result.Value.Stream, result.Value.ContentType);
    }
}
