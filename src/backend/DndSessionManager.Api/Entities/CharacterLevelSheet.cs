namespace DndSessionManager.Api.Entities;

public class CharacterLevelSheet
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public int Level { get; set; }
    public int HpMax { get; set; }
    public int ProficiencyBonus { get; set; }
    public DateTime CreatedAt { get; set; }
    public Character? Character { get; set; }
    public CharacterSpellcasting? Spellcasting { get; set; }
    public ICollection<CharacterSpell> Spells { get; set; } = new List<CharacterSpell>();
    public ICollection<CharacterSpellSlot> SpellSlots { get; set; } = new List<CharacterSpellSlot>();
}
