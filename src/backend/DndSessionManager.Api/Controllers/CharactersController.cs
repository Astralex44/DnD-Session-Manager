using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Facades;
using DndSessionManager.Api.Pdf;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;

namespace DndSessionManager.Api.Controllers;

[ApiController]
[Route("api/games/{gameId:guid}/characters")]
[Authorize(Policy = GamePolicies.Member)]
public class CharactersController(ICharacterFacade characterFacade, ICurrencyFacade currencyFacade) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CharacterDto>>> GetAll(Guid gameId) =>
        Ok(await characterFacade.GetCharactersForGameAsync(gameId, HttpContext.GetGameCaller()));

    [HttpGet("party")]
    public async Task<ActionResult<IReadOnlyList<PartyMemberDto>>> GetParty(Guid gameId) =>
        Ok(await characterFacade.GetPartyAsync(gameId));

    [CharacterAccess(CharacterAccess.Read)]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CharacterDetailDto>> GetById(Guid gameId, Guid id)
    {
        var character = await characterFacade.GetCharacterDetailAsync(gameId, id);
        return character is null ? NotFound() : Ok(character);
    }

    [CharacterAccess(CharacterAccess.Read)]
    [HttpGet("{id:guid}/pdf")]
    public async Task<IActionResult> GetPdf(Guid gameId, Guid id)
    {
        var character = await characterFacade.GetCharacterDetailAsync(gameId, id);
        if (character is null) return NotFound();

        var bytes = new CharacterSheetDocument(character).GeneratePdf();
        var fileName = $"{character.Name.Replace(' ', '_')}.pdf";
        return File(bytes, "application/pdf", fileName);
    }

    [HttpPost]
    public async Task<ActionResult<CharacterDto>> Create(Guid gameId, [FromBody] CreateCharacterDto input)
    {
        var character = await characterFacade.CreateCharacterAsync(gameId, input, HttpContext.GetGameCaller().UserId);
        return CreatedAtAction(nameof(GetById), new { gameId, id = character.Id }, character);
    }

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<CharacterDetailDto>> Update(Guid gameId, Guid id, [FromBody] UpdateCharacterDto input)
    {
        var character = await characterFacade.UpdateCharacterAsync(gameId, id, input);
        return character is null ? NotFound() : Ok(character);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid gameId, Guid id)
    {
        return await characterFacade.DeleteCharacterAsync(gameId, id) ? NoContent() : NotFound();
    }

    // DM assigns a character to a member's account (pre-login characters
    // start unowned). No CharacterAccess here: the DM may do it for any
    // character, owned or not.
    [Authorize(Policy = GamePolicies.Dm)]
    [HttpPut("{id:guid}/owner")]
    public async Task<ActionResult<CharacterDto>> SetOwner(Guid gameId, Guid id, [FromBody] SetCharacterOwnerDto input)
    {
        var character = await characterFacade.SetOwnerAsync(gameId, id, input.UserId, HttpContext.GetGameCaller());
        return character is null ? NotFound() : Ok(character);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<CharacterDto>> SetStatus(Guid gameId, Guid id, [FromBody] UpdateStatusDto input)
    {
        var character = await characterFacade.SetCharacterStatusAsync(gameId, id, input.Status);
        return character is null ? NotFound() : Ok(character);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPatch("{id:guid}/skills/{skillId:guid}")]
    public async Task<ActionResult<SkillDto>> SetSkillProficiency(Guid gameId, Guid id, Guid skillId, [FromBody] UpdateProficiencyDto input)
    {
        var skill = await characterFacade.SetSkillProficiencyAsync(gameId, id, skillId, input.Proficient);
        return skill is null ? NotFound() : Ok(skill);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPatch("{id:guid}/saves/{saveId:guid}")]
    public async Task<ActionResult<SaveDto>> SetSaveProficiency(Guid gameId, Guid id, Guid saveId, [FromBody] UpdateProficiencyDto input)
    {
        var save = await characterFacade.SetSaveProficiencyAsync(gameId, id, saveId, input.Proficient);
        return save is null ? NotFound() : Ok(save);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPost("{id:guid}/attacks")]
    public async Task<ActionResult<AttackDto>> AddAttack(Guid gameId, Guid id, [FromBody] CreateAttackDto input)
    {
        var attack = await characterFacade.AddAttackAsync(gameId, id, input);
        return attack is null ? NotFound() : Ok(attack);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPut("{id:guid}/attacks/{attackId:guid}")]
    public async Task<ActionResult<AttackDto>> UpdateAttack(Guid gameId, Guid id, Guid attackId, [FromBody] CreateAttackDto input)
    {
        var attack = await characterFacade.UpdateAttackAsync(gameId, id, attackId, input);
        return attack is null ? NotFound() : Ok(attack);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpDelete("{id:guid}/attacks/{attackId:guid}")]
    public async Task<IActionResult> RemoveAttack(Guid gameId, Guid id, Guid attackId) =>
        await characterFacade.RemoveAttackAsync(gameId, id, attackId) ? NoContent() : NotFound();

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPost("{id:guid}/items")]
    public async Task<ActionResult<ItemDto>> AddItem(Guid gameId, Guid id, [FromBody] CreateItemDto input)
    {
        var item = await characterFacade.AddItemAsync(gameId, id, input);
        return item is null ? NotFound() : Ok(item);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<ActionResult<ItemDto>> UpdateItem(Guid gameId, Guid id, Guid itemId, [FromBody] CreateItemDto input)
    {
        var item = await characterFacade.UpdateItemAsync(gameId, id, itemId, input);
        return item is null ? NotFound() : Ok(item);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid gameId, Guid id, Guid itemId) =>
        await characterFacade.RemoveItemAsync(gameId, id, itemId) ? NoContent() : NotFound();

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpPost("{id:guid}/level-sheets")]
    public async Task<ActionResult<LevelSheetDetailDto>> CreateLevelSheet(Guid gameId, Guid id, [FromBody] CreateLevelSheetDto input)
    {
        var levelSheet = await characterFacade.CreateLevelSheetAsync(gameId, id, input);
        return levelSheet is null ? NotFound() : Ok(levelSheet);
    }

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpPatch("{id:guid}/active-level-sheet")]
    public async Task<ActionResult<CharacterDetailDto>> SetActiveLevelSheet(Guid gameId, Guid id, [FromBody] SetActiveLevelSheetDto input)
    {
        var character = await characterFacade.SetActiveLevelSheetAsync(gameId, id, input.LevelSheetId);
        return character is null ? NotFound() : Ok(character);
    }

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpPatch("{id:guid}/level-sheets/{levelSheetId:guid}/hp-max")]
    public async Task<ActionResult<LevelSheetDetailDto>> UpdateHpMax(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpdateHpMaxDto input)
    {
        var levelSheet = await characterFacade.UpdateHpMaxAsync(gameId, id, levelSheetId, input.HpMax);
        return levelSheet is null ? NotFound() : Ok(levelSheet);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}")]
    public async Task<ActionResult<RemoveLevelSheetResultDto>> RemoveLevelSheet(Guid gameId, Guid id, Guid levelSheetId)
    {
        var result = await characterFacade.RemoveLevelSheetAsync(gameId, id, levelSheetId);
        if (result is null) return NotFound();
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPut("{id:guid}/level-sheets/{levelSheetId:guid}/spellcasting")]
    public async Task<ActionResult<SpellcastingDto>> UpsertSpellcasting(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpsertSpellcastingDto input)
    {
        var spellcasting = await characterFacade.UpsertSpellcastingAsync(gameId, id, levelSheetId, input);
        return spellcasting is null ? NotFound() : Ok(spellcasting);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPost("{id:guid}/level-sheets/{levelSheetId:guid}/spells")]
    public async Task<ActionResult<SpellDto>> AddSpell(Guid gameId, Guid id, Guid levelSheetId, [FromBody] CreateSpellDto input)
    {
        var spell = await characterFacade.AddSpellAsync(gameId, id, levelSheetId, input);
        return spell is null ? NotFound() : Ok(spell);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPatch("{id:guid}/level-sheets/{levelSheetId:guid}/spells/{spellId:guid}")]
    public async Task<ActionResult<SpellDto>> SetSpellPrepared(Guid gameId, Guid id, Guid levelSheetId, Guid spellId, [FromBody] UpdateProficiencyDto input)
    {
        var spell = await characterFacade.SetSpellPreparedAsync(gameId, id, levelSheetId, spellId, input.Proficient);
        return spell is null ? NotFound() : Ok(spell);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}/spells/{spellId:guid}")]
    public async Task<IActionResult> RemoveSpell(Guid gameId, Guid id, Guid levelSheetId, Guid spellId) =>
        await characterFacade.RemoveSpellAsync(gameId, id, levelSheetId, spellId) ? NoContent() : NotFound();

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpPut("{id:guid}/level-sheets/{levelSheetId:guid}/spell-slots")]
    public async Task<ActionResult<SpellSlotDto>> UpsertSpellSlot(Guid gameId, Guid id, Guid levelSheetId, [FromBody] UpsertSpellSlotDto input)
    {
        var slot = await characterFacade.UpsertSpellSlotAsync(gameId, id, levelSheetId, input);
        return slot is null ? NotFound() : Ok(slot);
    }

    [CharacterAccess(CharacterAccess.OwnerOrDm)]
    [HttpDelete("{id:guid}/level-sheets/{levelSheetId:guid}/spell-slots/{slotId:guid}")]
    public async Task<IActionResult> RemoveSpellSlot(Guid gameId, Guid id, Guid levelSheetId, Guid slotId) =>
        await characterFacade.RemoveSpellSlotAsync(gameId, id, levelSheetId, slotId) ? NoContent() : NotFound();

    [CharacterAccess(CharacterAccess.Read)]
    [HttpGet("{id:guid}/currency")]
    public async Task<ActionResult<IReadOnlyList<CharacterCurrencyDto>>> GetWallet(Guid gameId, Guid id)
    {
        var wallet = await currencyFacade.GetCharacterWalletAsync(gameId, id);
        return wallet is null ? NotFound() : Ok(wallet);
    }

    [CharacterAccess(CharacterAccess.Owner)]
    [HttpPut("{id:guid}/currency/{denominationId:guid}")]
    public async Task<ActionResult<CharacterCurrencyDto>> SetWalletEntry(Guid gameId, Guid id, Guid denominationId, [FromBody] SetCharacterCurrencyDto input)
    {
        var entry = await currencyFacade.SetCharacterCurrencyAsync(gameId, id, denominationId, input);
        return entry is null ? NotFound() : Ok(entry);
    }
}
