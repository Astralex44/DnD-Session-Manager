using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class CharacterFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : ICharacterFacade
{
    public async Task<IReadOnlyList<CharacterDto>> GetCharactersForGameAsync(Guid gameId) =>
        (await unitOfWork.Characters.GetByGameIdAsync(gameId)).Select(ToDto).ToList();

    public async Task<CharacterDetailDto?> GetCharacterDetailAsync(Guid gameId, Guid characterId)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        return character is null ? null : await ToDetailDtoAsync(character);
    }

    public async Task<CharacterDto> CreateCharacterAsync(Guid gameId, CreateCharacterDto input)
    {
        var levelSheet = new CharacterLevelSheet
        {
            Id = Guid.NewGuid(),
            Level = input.Level,
            HpMax = input.HpMax,
            ProficiencyBonus = input.ProficiencyBonus,
            CreatedAt = DateTime.UtcNow,
        };
        var character = new Character
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = input.Name.Trim(),
            Race = input.Race.Trim(),
            Class = input.Class.Trim(),
            PlayerName = input.PlayerName.Trim(),
            Background = input.Background,
            Alignment = input.Alignment,
            ExperiencePoints = input.ExperiencePoints,
            Strength = input.Strength,
            Dexterity = input.Dexterity,
            Constitution = input.Constitution,
            Intelligence = input.Intelligence,
            Wisdom = input.Wisdom,
            Charisma = input.Charisma,
            ArmorClass = input.ArmorClass,
            Speed = input.Speed,
            HpCurrent = input.HpMax,
            Status = "active",
        };
        character.LevelSheets.Add(levelSheet);

        foreach (var skillName in CharacterSheetConstants.Skills)
        {
            character.Skills.Add(new CharacterSkill { Id = Guid.NewGuid(), CharacterId = character.Id, SkillName = skillName });
        }
        foreach (var ability in CharacterSheetConstants.Abilities)
        {
            character.Saves.Add(new CharacterSave { Id = Guid.NewGuid(), CharacterId = character.Id, Ability = ability });
        }

        await unitOfWork.Characters.AddAsync(character);
        // Character.ActiveLevelSheetId and CharacterLevelSheet.CharacterId form a mutual FK
        // between two brand-new rows; EF can't order a single INSERT batch for that, so the
        // active pointer is set in a second pass once both rows exist.
        await unitOfWork.SaveChangesAsync();
        character.ActiveLevelSheetId = levelSheet.Id;
        await unitOfWork.SaveChangesAsync();
        return ToDto(character);
    }

    public async Task<CharacterDetailDto?> UpdateCharacterAsync(Guid gameId, Guid characterId, UpdateCharacterDto input)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return null;

        character.Name = input.Name.Trim();
        character.Race = input.Race.Trim();
        character.Class = input.Class.Trim();
        character.Background = input.Background;
        character.Alignment = input.Alignment;
        character.PlayerName = input.PlayerName.Trim();
        character.ExperiencePoints = input.ExperiencePoints;
        character.Strength = input.Strength;
        character.Dexterity = input.Dexterity;
        character.Constitution = input.Constitution;
        character.Intelligence = input.Intelligence;
        character.Wisdom = input.Wisdom;
        character.Charisma = input.Charisma;
        character.Inspiration = input.Inspiration;
        character.ArmorClass = input.ArmorClass;
        character.Initiative = input.Initiative;
        character.Speed = input.Speed;
        character.HpCurrent = input.HpCurrent;
        character.HpTemporary = input.HpTemporary;
        character.HitDiceTotal = input.HitDiceTotal;
        character.DeathSaveSuccesses = input.DeathSaveSuccesses;
        character.DeathSaveFailures = input.DeathSaveFailures;
        character.PassivePerception = input.PassivePerception;
        character.OtherProficiencies = input.OtherProficiencies;
        character.PersonalityTraits = input.PersonalityTraits;
        character.Ideals = input.Ideals;
        character.Bonds = input.Bonds;
        character.Flaws = input.Flaws;
        character.Backstory = input.Backstory;
        character.Appearance = input.Appearance;
        character.Age = input.Age;
        character.Height = input.Height;
        character.Weight = input.Weight;
        character.Eyes = input.Eyes;
        character.Skin = input.Skin;
        character.Hair = input.Hair;
        character.AlliesOrganizations = input.AlliesOrganizations;
        character.AdditionalFeatures = input.AdditionalFeatures;
        character.FeaturesTraits = input.FeaturesTraits;
        character.Treasure = input.Treasure;
        character.Status = input.Status;

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "characters");
        return await ToDetailDtoAsync(character);
    }

    public async Task<CharacterDto?> SetCharacterStatusAsync(Guid gameId, Guid characterId, string status)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return null;

        character.Status = status;
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "characters");
        return ToDto(character);
    }

    public async Task<bool> DeleteCharacterAsync(Guid gameId, Guid characterId)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return false;

        // Same mutual-FK issue as character creation: Character.ActiveLevelSheetId and
        // CharacterLevelSheet.CharacterId reference each other, so EF can't order a single
        // DELETE batch that removes both. Clearing the pointer first breaks the cycle before
        // the cascade delete removes the level sheets (and their spells/slots) along with it.
        if (character.ActiveLevelSheetId is not null)
        {
            character.ActiveLevelSheetId = null;
            await unitOfWork.SaveChangesAsync();
        }

        unitOfWork.Characters.Remove(character);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<SkillDto?> SetSkillProficiencyAsync(Guid gameId, Guid characterId, Guid skillId, bool proficient)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var skill = await unitOfWork.CharacterSkills.GetByIdAsync(skillId);
        if (skill is null || skill.CharacterId != characterId) return null;

        skill.Proficient = proficient;
        await unitOfWork.SaveChangesAsync();
        return new SkillDto(skill.Id, skill.SkillName, skill.Proficient);
    }

    public async Task<SaveDto?> SetSaveProficiencyAsync(Guid gameId, Guid characterId, Guid saveId, bool proficient)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var save = await unitOfWork.CharacterSaves.GetByIdAsync(saveId);
        if (save is null || save.CharacterId != characterId) return null;

        save.Proficient = proficient;
        await unitOfWork.SaveChangesAsync();
        return new SaveDto(save.Id, save.Ability, save.Proficient);
    }

    public async Task<AttackDto?> AddAttackAsync(Guid gameId, Guid characterId, CreateAttackDto input)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var attack = new CharacterAttack
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Name = input.Name.Trim(),
            AtkBonus = input.AtkBonus.Trim(),
            DamageType = input.DamageType.Trim(),
        };
        await unitOfWork.CharacterAttacks.AddAsync(attack);
        await unitOfWork.SaveChangesAsync();
        return new AttackDto(attack.Id, attack.Name, attack.AtkBonus, attack.DamageType);
    }

    public async Task<AttackDto?> UpdateAttackAsync(Guid gameId, Guid characterId, Guid attackId, CreateAttackDto input)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var attack = await unitOfWork.CharacterAttacks.GetByIdAsync(attackId);
        if (attack is null || attack.CharacterId != characterId) return null;

        attack.Name = input.Name.Trim();
        attack.AtkBonus = input.AtkBonus.Trim();
        attack.DamageType = input.DamageType.Trim();

        await unitOfWork.SaveChangesAsync();
        return new AttackDto(attack.Id, attack.Name, attack.AtkBonus, attack.DamageType);
    }

    public async Task<bool> RemoveAttackAsync(Guid gameId, Guid characterId, Guid attackId)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return false;
        var attack = await unitOfWork.CharacterAttacks.GetByIdAsync(attackId);
        if (attack is null || attack.CharacterId != characterId) return false;

        unitOfWork.CharacterAttacks.Remove(attack);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<ItemDto?> AddItemAsync(Guid gameId, Guid characterId, CreateItemDto input)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var item = new CharacterItem
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Category = input.Category.Trim(),
            Name = input.Name.Trim(),
            Quantity = input.Quantity,
            Weight = input.Weight,
            Description = input.Description,
        };
        await unitOfWork.CharacterItems.AddAsync(item);
        await unitOfWork.SaveChangesAsync();
        return new ItemDto(item.Id, item.Category, item.Name, item.Quantity, item.Weight, item.Description);
    }

    public async Task<bool> RemoveItemAsync(Guid gameId, Guid characterId, Guid itemId)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return false;
        var item = await unitOfWork.CharacterItems.GetByIdAsync(itemId);
        if (item is null || item.CharacterId != characterId) return false;

        unitOfWork.CharacterItems.Remove(item);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<LevelSheetDetailDto?> CreateLevelSheetAsync(Guid gameId, Guid characterId, CreateLevelSheetDto input)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return null;

        // Ability scores live on Character now (always editable, not tied to a level),
        // so leveling up is just HP (previous max + the amount added this level, per
        // Hit Dice roll + Constitution modifier — computed by the player, entered as
        // HpToAdd) and Proficiency Bonus.
        var previousHpMax = character.ActiveLevelSheetId is { } activeSheetId
            ? (await unitOfWork.CharacterLevelSheets.GetByIdAsync(activeSheetId))?.HpMax ?? 0
            : 0;

        var levelSheet = new CharacterLevelSheet
        {
            Id = Guid.NewGuid(),
            CharacterId = characterId,
            Level = input.Level,
            HpMax = previousHpMax + input.HpToAdd,
            ProficiencyBonus = input.ProficiencyBonus,
            CreatedAt = DateTime.UtcNow,
        };
        await unitOfWork.CharacterLevelSheets.AddAsync(levelSheet);

        // Business rule: everything except HP/proficiency bonus/spell slots carries
        // forward unchanged on level-up, so known spells and the spellcasting profile
        // are cloned from the previous active sheet onto the new one. Spell slots are
        // not copied — those totals change with level and are set explicitly by the DM.
        if (character.ActiveLevelSheetId is { } previousSheetId)
        {
            var previousSheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(previousSheetId);
            if (previousSheet is not null)
            {
                if (previousSheet.Spellcasting is { } previousSpellcasting)
                {
                    await unitOfWork.CharacterSpellcastings.AddAsync(new CharacterSpellcasting
                    {
                        Id = Guid.NewGuid(),
                        LevelSheetId = levelSheet.Id,
                        Class = previousSpellcasting.Class,
                        Ability = previousSpellcasting.Ability,
                        SpellSaveDc = previousSpellcasting.SpellSaveDc,
                        SpellAttackBonus = previousSpellcasting.SpellAttackBonus,
                    });
                }

                foreach (var previousSpell in previousSheet.Spells)
                {
                    await unitOfWork.CharacterSpells.AddAsync(new CharacterSpell
                    {
                        Id = Guid.NewGuid(),
                        LevelSheetId = levelSheet.Id,
                        Level = previousSpell.Level,
                        Name = previousSpell.Name,
                        Prepared = previousSpell.Prepared,
                        Description = previousSpell.Description,
                        IsHomebrew = previousSpell.IsHomebrew,
                    });
                }
            }
        }

        if (input.MakeActive)
        {
            character.ActiveLevelSheetId = levelSheet.Id;
        }

        await unitOfWork.SaveChangesAsync();
        return ToLevelSheetDetailDto(levelSheet);
    }

    public async Task<CharacterDetailDto?> SetActiveLevelSheetAsync(Guid gameId, Guid characterId, Guid levelSheetId)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return null;

        var levelSheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(levelSheetId);
        if (levelSheet is null || levelSheet.CharacterId != characterId) return null;

        character.ActiveLevelSheetId = levelSheetId;
        await unitOfWork.SaveChangesAsync();
        return await ToDetailDtoAsync(character);
    }

    public async Task<LevelSheetDetailDto?> UpdateHpMaxAsync(Guid gameId, Guid characterId, Guid levelSheetId, int hpMax)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;

        var levelSheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(levelSheetId);
        if (levelSheet is null || levelSheet.CharacterId != characterId) return null;

        levelSheet.HpMax = hpMax;
        await unitOfWork.SaveChangesAsync();
        return ToLevelSheetDetailDto(levelSheet);
    }

    public async Task<RemoveLevelSheetResultDto?> RemoveLevelSheetAsync(Guid gameId, Guid characterId, Guid levelSheetId)
    {
        var character = await GetOwnedCharacterAsync(gameId, characterId);
        if (character is null) return null;

        var levelSheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(levelSheetId);
        if (levelSheet is null || levelSheet.CharacterId != characterId) return null;

        var allSheets = await unitOfWork.CharacterLevelSheets.GetByCharacterIdAsync(characterId);
        if (allSheets.Count <= 1)
        {
            return new RemoveLevelSheetResultDto(false, "Can't delete the only level — a character always needs at least one.", null);
        }

        // Falling back to the highest remaining level below the deleted one mirrors
        // "undo my last level-up"; if the lowest level itself is deleted, fall back
        // to whatever level is now highest instead.
        if (character.ActiveLevelSheetId == levelSheetId)
        {
            var fallback = allSheets
                .Where(s => s.Id != levelSheetId && s.Level < levelSheet.Level)
                .OrderByDescending(s => s.Level)
                .FirstOrDefault()
                ?? allSheets.Where(s => s.Id != levelSheetId).OrderByDescending(s => s.Level).First();
            character.ActiveLevelSheetId = fallback.Id;
        }

        unitOfWork.CharacterLevelSheets.Remove(levelSheet);
        await unitOfWork.SaveChangesAsync();
        return new RemoveLevelSheetResultDto(true, null, await ToDetailDtoAsync(character));
    }

    public async Task<SpellcastingDto?> UpsertSpellcastingAsync(Guid gameId, Guid characterId, Guid levelSheetId, UpsertSpellcastingDto input)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return null;

        var spellcasting = await unitOfWork.CharacterSpellcastings.GetByLevelSheetIdAsync(levelSheetId);
        if (spellcasting is null)
        {
            spellcasting = new CharacterSpellcasting { Id = Guid.NewGuid(), LevelSheetId = levelSheetId };
            await unitOfWork.CharacterSpellcastings.AddAsync(spellcasting);
        }

        spellcasting.Class = input.Class.Trim();
        spellcasting.Ability = input.Ability;
        spellcasting.SpellSaveDc = input.SpellSaveDc;
        spellcasting.SpellAttackBonus = input.SpellAttackBonus;

        await unitOfWork.SaveChangesAsync();
        return new SpellcastingDto(spellcasting.Id, spellcasting.Class, spellcasting.Ability, spellcasting.SpellSaveDc, spellcasting.SpellAttackBonus);
    }

    public async Task<SpellDto?> AddSpellAsync(Guid gameId, Guid characterId, Guid levelSheetId, CreateSpellDto input)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return null;

        var spell = new CharacterSpell
        {
            Id = Guid.NewGuid(),
            LevelSheetId = levelSheetId,
            Level = input.Level,
            Name = input.Name.Trim(),
            Prepared = input.Prepared,
            Description = input.IsHomebrew ? input.Description : null,
            IsHomebrew = input.IsHomebrew,
        };
        await unitOfWork.CharacterSpells.AddAsync(spell);
        await unitOfWork.SaveChangesAsync();
        return ToSpellDto(spell);
    }

    public async Task<SpellDto?> SetSpellPreparedAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid spellId, bool prepared)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return null;
        var spell = await unitOfWork.CharacterSpells.GetByIdAsync(spellId);
        if (spell is null || spell.LevelSheetId != levelSheetId) return null;

        spell.Prepared = prepared;
        await unitOfWork.SaveChangesAsync();
        return ToSpellDto(spell);
    }

    public async Task<bool> RemoveSpellAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid spellId)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return false;
        var spell = await unitOfWork.CharacterSpells.GetByIdAsync(spellId);
        if (spell is null || spell.LevelSheetId != levelSheetId) return false;

        unitOfWork.CharacterSpells.Remove(spell);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<SpellSlotDto?> UpsertSpellSlotAsync(Guid gameId, Guid characterId, Guid levelSheetId, UpsertSpellSlotDto input)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return null;

        var slots = await unitOfWork.CharacterSpellSlots.GetByLevelSheetIdAsync(levelSheetId);
        var slot = slots.FirstOrDefault(s => s.Level == input.Level);
        if (slot is null)
        {
            slot = new CharacterSpellSlot { Id = Guid.NewGuid(), LevelSheetId = levelSheetId, Level = input.Level };
            await unitOfWork.CharacterSpellSlots.AddAsync(slot);
        }

        slot.Total = input.Total;
        slot.Expended = input.Expended;

        await unitOfWork.SaveChangesAsync();
        return new SpellSlotDto(slot.Id, slot.Level, slot.Total, slot.Expended);
    }

    public async Task<bool> RemoveSpellSlotAsync(Guid gameId, Guid characterId, Guid levelSheetId, Guid slotId)
    {
        if (await GetOwnedLevelSheetAsync(gameId, characterId, levelSheetId) is null) return false;
        var slot = await unitOfWork.CharacterSpellSlots.GetByIdAsync(slotId);
        if (slot is null || slot.LevelSheetId != levelSheetId) return false;

        unitOfWork.CharacterSpellSlots.Remove(slot);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    private async Task<Character?> GetOwnedCharacterAsync(Guid gameId, Guid characterId)
    {
        var character = await unitOfWork.Characters.GetByIdAsync(characterId);
        return character is not null && character.GameId == gameId ? character : null;
    }

    private async Task<CharacterLevelSheet?> GetOwnedLevelSheetAsync(Guid gameId, Guid characterId, Guid levelSheetId)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var levelSheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(levelSheetId);
        return levelSheet is not null && levelSheet.CharacterId == characterId ? levelSheet : null;
    }

    private async Task<CharacterDetailDto> ToDetailDtoAsync(Character character)
    {
        LevelSheetDetailDto? activeLevelSheet = null;
        if (character.ActiveLevelSheetId is { } activeId)
        {
            var sheet = await unitOfWork.CharacterLevelSheets.GetByIdAsync(activeId);
            if (sheet is not null) activeLevelSheet = ToLevelSheetDetailDto(sheet);
        }

        return new CharacterDetailDto(
            character.Id, character.GameId, character.Name, character.Race, character.Class,
            character.Background, character.Alignment, character.PlayerName, character.ExperiencePoints,
            character.Strength, character.Dexterity, character.Constitution,
            character.Intelligence, character.Wisdom, character.Charisma,
            character.Inspiration, character.ArmorClass, character.Initiative, character.Speed,
            character.HpCurrent, character.HpTemporary, character.HitDiceTotal,
            character.DeathSaveSuccesses, character.DeathSaveFailures, character.PassivePerception,
            character.OtherProficiencies, character.PersonalityTraits, character.Ideals, character.Bonds,
            character.Flaws, character.Backstory, character.Appearance, character.Age, character.Height,
            character.Weight, character.Eyes, character.Skin, character.Hair, character.AlliesOrganizations,
            character.AdditionalFeatures, character.FeaturesTraits, character.Treasure, character.Status,
            character.ActiveLevelSheetId,
            character.LevelSheets.OrderBy(s => s.Level).Select(s => new LevelSheetSummaryDto(s.Id, s.Level, s.HpMax)).ToList(),
            activeLevelSheet,
            character.Skills.OrderBy(s => s.SkillName).Select(s => new SkillDto(s.Id, s.SkillName, s.Proficient)).ToList(),
            character.Saves.OrderBy(s => Array.IndexOf(CharacterSheetConstants.Abilities, s.Ability))
                .Select(s => new SaveDto(s.Id, s.Ability, s.Proficient)).ToList(),
            character.Attacks.Select(a => new AttackDto(a.Id, a.Name, a.AtkBonus, a.DamageType)).ToList(),
            character.Items.Select(i => new ItemDto(i.Id, i.Category, i.Name, i.Quantity, i.Weight, i.Description)).ToList());
    }

    private static LevelSheetDetailDto ToLevelSheetDetailDto(CharacterLevelSheet sheet) => new(
        sheet.Id, sheet.Level, sheet.HpMax, sheet.ProficiencyBonus,
        sheet.CreatedAt,
        sheet.Spellcasting is { } sc ? new SpellcastingDto(sc.Id, sc.Class, sc.Ability, sc.SpellSaveDc, sc.SpellAttackBonus) : null,
        sheet.Spells.OrderBy(s => s.Level).ThenBy(s => s.Name).Select(ToSpellDto).ToList(),
        sheet.SpellSlots.OrderBy(s => s.Level).Select(s => new SpellSlotDto(s.Id, s.Level, s.Total, s.Expended)).ToList());

    private static SpellDto ToSpellDto(CharacterSpell spell) =>
        new(spell.Id, spell.Level, spell.Name, spell.Prepared, spell.Description, spell.IsHomebrew);

    private static CharacterDto ToDto(Character character) => new(
        character.Id, character.GameId, character.Name, character.Race, character.Class,
        character.PlayerName, character.Status, character.HpCurrent, character.ActiveLevelSheet?.HpMax,
        character.ArmorClass, character.ActiveLevelSheetId, character.ActiveLevelSheet?.Level);
}
