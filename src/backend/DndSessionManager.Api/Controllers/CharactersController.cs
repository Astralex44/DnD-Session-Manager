using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Pdf;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/characters")]
public class CharactersController(ICharacterFacade characterFacade, ICurrencyFacade currencyFacade, IAccessLockFacade accessLockFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CharacterDto>>> GetAll(Guid gameId) =>
        Ok(await characterFacade.GetCharactersForGameAsync(gameId));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterDetailDto>> GetById(Guid gameId, Guid id)
    {
        if (!await HasAccessAsync(gameId, id)) return StatusCode(403);

        var character = await characterFacade.GetCharacterDetailAsync(gameId, id);
        return character is null ? NotFound() : Ok(character);
    }

    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> GetPdf(Guid gameId, Guid id)
    {
        if (!await HasAccessAsync(gameId, id)) return StatusCode(403);

        var character = await characterFacade.GetCharacterDetailAsync(gameId, id);
        if (character is null) return NotFound();

        var bytes = new CharacterSheetDocument(character).GeneratePdf();
        var fileName = $"{character.Name.Replace(' ', '_')}.pdf";
        return File(bytes, "application/pdf", fileName);
    }

    [HttpPost]
    public async Task<ActionResult<CharacterDto>> Create(Guid gameId, [FromBody] CreateCharacterDto input)
    {
        var character = await characterFacade.CreateCharacterAsync(gameId, input);
        return CreatedAtAction(nameof(GetById), new { gameId, id = character.Id }, character);
    }

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<CharacterDetailDto>> Update(Guid gameId, Guid id, [FromBody] UpdateCharacterDto input)
    {
        if (!await HasAccessAsync(gameId, id)) return StatusCode(403);

        var character = await characterFacade.UpdateCharacterAsync(gameId, id, input);
        return character is null ? NotFound() : Ok(character);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id)
    {
        if (!await HasAccessAsync(gameId, id)) return StatusCode(403);

        return await characterFacade.DeleteCharacterAsync(gameId, id) ? NoContent() : NotFound();
    }

    // Only these few high-value actions (view/edit/export/delete the sheet
    // itself) check the code — see AccessLock: a temporary, simple stand-in
    // for real auth, not exhaustive protection of every sub-resource
    // (attacks/items/spells/level-up stay open for now, deliberately, given
    // the scope of this — the UI can't reach them without GetById anyway).
    // GetPdf is a plain <a href> download, which can't attach a custom
    // header, so it also accepts the code as a ?code= query param.
    private Task<bool> HasAccessAsync(Guid gameId, Guid characterId)
    {
        string? code = Request.Headers["X-Access-Code"];
        if (string.IsNullOrEmpty(code)) code = Request.Query["code"];
        return accessLockFacade.VerifyCodeAsync(gameId, "Character", characterId.ToString(), code);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<CharacterDto>> SetStatus(Guid gameId, Guid id, [FromBody] UpdateStatusDto input)
    {
        var character = await characterFacade.SetCharacterStatusAsync(gameId, id, input.Status);
        return character is null ? NotFound() : Ok(character);
    }

    [HttpPatch("{id:guid}/skills/{skillId:guid}")]
    public async Task<ActionResult<SkillDto>> SetSkillProficiency(Guid gameId, Guid id, Guid skillId, [FromBody] UpdateProficiencyDto input)
    {
        var skill = await characterFacade.SetSkillProficiencyAsync(gameId, id, skillId, input.Proficient);
        return skill is null ? NotFound() : Ok(skill);
    }

    [HttpPatch("{id:guid}/saves/{saveId:guid}")]
    public async Task<ActionResult<SaveDto>> SetSaveProficiency(Guid gameId, Guid id, Guid saveId, [FromBody] UpdateProficiencyDto input)
    {
        var save = await characterFacade.SetSaveProficiencyAsync(gameId, id, saveId, input.Proficient);
        return save is null ? NotFound() : Ok(save);
    }

    [HttpPost("{id:guid}/attacks")]
    public async Task<ActionResult<AttackDto>> AddAttack(Guid gameId, Guid id, [FromBody] CreateAttackDto input)
    {
        var attack = await characterFacade.AddAttackAsync(gameId, id, input);
        return attack is null ? NotFound() : Ok(attack);
    }

    [HttpPut("{id:guid}/attacks/{attackId:guid}")]
    public async Task<ActionResult<AttackDto>> UpdateAttack(Guid gameId, Guid id, Guid attackId, [FromBody] CreateAttackDto input)
    {
        var attack = await characterFacade.UpdateAttackAsync(gameId, id, attackId, input);
        return attack is null ? NotFound() : Ok(attack);
    }

    [HttpDelete("{id:guid}/attacks/{attackId:guid}")]
    public async Task<IActionResult> RemoveAttack(Guid gameId, Guid id, Guid attackId) =>
        await characterFacade.RemoveAttackAsync(gameId, id, attackId) ? NoContent() : NotFound();

    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ItemDto>> AddItem(Guid gameId, Guid id, [FromBody] CreateItemDto input)
    {
        var item = await characterFacade.AddItemAsync(gameId, id, input);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ItemDto>> UpdateItem(Guid gameId, Guid id, Guid itemId, [FromBody] CreateItemDto input)
    {
        var item = await characterFacade.UpdateItemAsync(gameId, id, itemId, input);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid gameId, Guid id, Guid itemId) =>
        await characterFacade.RemoveItemAsync(gameId, id, itemId) ? NoContent() : NotFound();

    [HttpPost("{id:guid}/level-sheets")]
    public async Task<ActionResult<LevelSheetDetailDto>> CreateLevelSheet(Guid gameId, Guid id, [FromBody] CreateLevelSheetDto input)
    {
        var levelSheet = await characterFacade.CreateLevelSheetAsync(gameId, id, input);
        return levelSheet is null ? NotFound() : Ok(levelSheet);
    }

    [HttpPatch("{id:guid}/active-level-sheet")]
    public async Task<ActionResult<CharacterDetailDto>> SetActiveLevelSheet(Guid gameId, Guid id, [FromBody] SetActiveLevelSheetDto input)
    {
        var character = await characterFacade.SetActiveLevelSheetAsync(gameId, id, input.LevelSheetId);
        return character is null ? NotFound() : Ok(character);
    }

    [HttpPatch("{id:guid}/level-sheets/{levelSheetId:guid}/hp-max")]
    public async Task<ActionResult<LevelSheetDetailDto>> UpdateHpMax(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpdateHpMaxDto input)
    {
        var levelSheet = await characterFacade.UpdateHpMaxAsync(gameId, id, levelSheetId, input.HpMax);
        return levelSheet is null ? NotFound() : Ok(levelSheet);
    }

    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}")]
    public async Task<ActionResult<RemoveLevelSheetResultDto>> RemoveLevelSheet(Guid gameId, Guid id, Guid levelSheetId)
    {
        var result = await characterFacade.RemoveLevelSheetAsync(gameId, id, levelSheetId);
        if (result is null) return NotFound();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPut("{id:guid}/level-sheets/{levelSheetId:guid}/spellcasting")]
    public async Task<ActionResult<SpellcastingDto>> UpsertSpellcasting(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpsertSpellcastingDto input)
    {
        var spellcasting = await characterFacade.UpsertSpellcastingAsync(gameId, id, levelSheetId, input);
        return spellcasting is null ? NotFound() : Ok(spellcasting);
    }

    [HttpPost("{id:guid}/level-sheets/{levelSheetId:guid}/spells")]
    public async Task<ActionResult<SpellDto>> AddSpell(Guid gameId, Guid id, Guid levelSheetId, [FromBody] CreateSpellDto input)
    {
        var spell = await characterFacade.AddSpellAsync(gameId, id, levelSheetId, input);
        return spell is null ? NotFound() : Ok(spell);
    }

    [HttpPatch("{id:guid}/level-sheets/{levelSheetId:guid}/spells/{spellId:guid}")]
    public async Task<ActionResult<SpellDto>> SetSpellPrepared(Guid gameId, Guid id, Guid levelSheetId, Guid spellId, [FromBody] UpdateProficiencyDto input)
    {
        var spell = await characterFacade.SetSpellPreparedAsync(gameId, id, levelSheetId, spellId, input.Proficient);
        return spell is null ? NotFound() : Ok(spell);
    }

    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}/spells/{spellId:guid}")]
    public async Task<IActionResult> RemoveSpell(Guid gameId, Guid id, Guid levelSheetId, Guid spellId) =>
        await characterFacade.RemoveSpellAsync(gameId, id, levelSheetId, spellId) ? NoContent() : NotFound();

    [HttpPut("{id:guid}/level-sheets/{levelSheetId:guid}/spell-slots")]
    public async Task<ActionResult<SpellSlotDto>> UpsertSpellSlot(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpsertSpellSlotDto input)
    {
        var slot = await characterFacade.UpsertSpellSlotAsync(gameId, id, levelSheetId, input);
        return slot is null ? NotFound() : Ok(slot);
    }

    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}/spell-slots/{slotId:guid}")]
    public async Task<IActionResult> RemoveSpellSlot(Guid gameId, Guid id, Guid levelSheetId, Guid slotId) =>
        await characterFacade.RemoveSpellSlotAsync(gameId, id, levelSheetId, slotId) ? NoContent() : NotFound();

    [HttpGet("{id:guid}/currency")]
    public async Task<ActionResult<IReadOnlyList<CharacterCurrencyDto>>> GetWallet(Guid gameId, Guid id)
    {
        var wallet = await currencyFacade.GetCharacterWalletAsync(gameId, id);
        return wallet is null ? NotFound() : Ok(wallet);
    }

    [HttpPut("{id:guid}/currency/{denominationId:guid}")]
    public async Task<ActionResult<CharacterCurrencyDto>> SetWalletEntry(Guid gameId, Guid id, Guid denominationId, [FromBody] SetCharacterCurrencyDto input)
    {
        var entry = await currencyFacade.SetCharacterCurrencyAsync(gameId, id, denominationId, input);
        return entry is null ? NotFound() : Ok(entry);
    }
}
