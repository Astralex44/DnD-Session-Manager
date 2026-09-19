using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface ICharacterFacade
{
    Task<IReadOnlyList<CharacterDto>> GetCharactersForGameAsync(Guid gameId);
    Task<CharacterDetailDto?> GetCharacterDetailAsync(Guid gameId, Guid characterId);
    Task<CharacterDto> CreateCharacterAsync(Guid gameId, CreateCharacterDto input);
    Task<CharacterDetailDto?> UpdateCharacterAsync(Guid gameId, Guid characterId, UpdateCharacterDto input);
    Task<CharacterDto?> SetCharacterStatusAsync(Guid gameId, Guid characterId, string status);
    Task<bool> DeleteCharacterAsync(Guid gameId, Guid characterId);

    Task<SkillDto?> SetSkillProficiencyAsync(Guid gameId, Guid characterId, Guid skillId, bool proficient);
    Task<SaveDto?> SetSaveProficiencyAsync(Guid gameId, Guid characterId, Guid saveId, bool proficient);

    Task<AttackDto?> AddAttackAsync(Guid gameId, Guid characterId, CreateAttackDto input);
    Task<AttackDto?> UpdateAttackAsync(Guid gameId, Guid characterId, Guid attackId, CreateAttackDto input);
    Task<bool> RemoveAttackAsync(Guid gameId, Guid characterId, Guid attackId);

    Task<ItemDto?> AddItemAsync(Guid gameId, Guid characterId, CreateItemDto input);
    Task<bool> RemoveItemAsync(Guid gameId, Guid characterId, Guid itemId);

    Task<LevelSheetDetailDto?> CreateLevelSheetAsync(Guid gameId, Guid characterId, CreateLevelSheetDto input);
    Task<CharacterDetailDto?> SetActiveLevelSheetAsync(Guid gameId, Guid characterId, Guid levelSheetId);
    Task<LevelSheetDetailDto?> UpdateHpMaxAsync(Guid gameId, Guid characterId, Guid levelSheetId, int hpMax);
    Task<RemoveLevelSheetResultDto?> RemoveLevelSheetAsync(Guid gameId, Guid characterId, Guid levelSheetId);

    Task<SpellcastingDto?> UpsertSpellcastingAsync(Guid gameId, Guid characterId, Guid levelSheetId, UpsertSpellcastingDto input);
    Task<SpellDto?> AddSpellAsync(Guid gameId, Guid characterId, Guid levelSheetId, CreateSpellDto input);
    Task<SpellDto?> SetSpellPreparedAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid spellId, bool prepared);
    Task<bool> RemoveSpellAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid spellId);

    Task<SpellSlotDto?> UpsertSpellSlotAsync(Guid gameId, Guid characterId, Guid levelSheetId, UpsertSpellSlotDto input);
    Task<bool> RemoveSpellSlotAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid slotId);
}
