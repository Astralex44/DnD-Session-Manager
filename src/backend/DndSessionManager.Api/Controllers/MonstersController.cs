using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using Microsoft.AspNetCore.Mvc;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/monsters")]
public class MonstersController(IMonsterFacade monsterFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<MonsterDto>>> GetAll(Guid gameId) =>
        Ok(await monsterFacade.GetMonstersForGameAsync(gameId));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MonsterDto>> GetById(Guid gameId, Guid id)
    {
        var monster = await monsterFacade.GetMonsterAsync(gameId, id);
        return monster is null ? NotFound() : Ok(monster);
    }

    [HttpPost]
    public async Task<ActionResult<MonsterDto>> Create(Guid gameId, [FromForm] CreateMonsterDto input)
    {
        var monster = await monsterFacade.CreateMonsterAsync(gameId, input);
        return CreatedAtAction(nameof(GetById), new { gameId, id = monster.Id }, monster);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MonsterDto>> Update(Guid gameId, Guid id, [FromForm] UpdateMonsterDto input)
    {
        var monster = await monsterFacade.UpdateMonsterAsync(gameId, id, input);
        return monster is null ? NotFound() : Ok(monster);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id) =>
        await monsterFacade.DeleteMonsterAsync(gameId, id) ? NoContent() : NotFound();
}
