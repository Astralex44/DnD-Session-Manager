using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

// Files aren't routed under api/games/{gameId}, so the game comes from the
// Document/Monster that owns the file instead of the URL. Unknown file → 404
// before any role check, so this doesn't reveal which files exist.
// Documents: the DM of the document's game, or a player with one of their own
// characters on its share list — the same rule as GET documents.
[ApiController]
[Route("api/files/documents")]
[Authorize]
public class FilesController(
    IDocumentFileStorage fileStorage, IDocumentRepository documents, ICharacterRepository characters, IGameAccess gameAccess) : ControllerBase
{
    [HttpGet("{fileName}")]
    public async Task<IActionResult> GetDocumentFile(string fileName)
    {
        var document = await documents.GetByFileUrlAsync(DocumentFileStorage.UrlFor(fileName));
        if (document is null) return NotFound();
        var role = await gameAccess.GetRoleAsync(User, document.GameId);
        if (role is null) return Forbid();
        if (role != GameMemberRole.Dm)
        {
            var userId = GameAccess.GetUserId(User);
            var own = (await characters.GetByGameIdAsync(document.GameId))
                .Where(c => c.OwnerUserId == userId).Select(c => c.Id).ToHashSet();
            if (!document.Shares.Any(share => own.Contains(share.CharacterId))) return Forbid();
        }

        var result = await fileStorage.OpenAsync(fileName);
        return result is null ? NotFound() : File(result.Value.Stream, result.Value.ContentType);
    }
}

// Monster stat blocks are never shown to players (FA-03) — DM of the
// monster's game only.
[ApiController]
[Route("api/files/monsters")]
[Authorize]
public class MonsterFilesController(IMonsterFileStorage fileStorage, IMonsterRepository monsters, IGameAccess gameAccess) : ControllerBase
{
    [HttpGet("{fileName}")]
    public async Task<IActionResult> GetMonsterFile(string fileName)
    {
        var monster = await monsters.GetByFileUrlAsync(MonsterFileStorage.UrlFor(fileName));
        if (monster is null) return NotFound();
        if (await gameAccess.GetRoleAsync(User, monster.GameId) != GameMemberRole.Dm) return Forbid();

        var result = await fileStorage.OpenAsync(fileName);
        return result is null ? NotFound() : File(result.Value.Stream, result.Value.ContentType);
    }
}
