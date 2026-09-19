namespace DndSessionManager.Api.Entities;

public class CharacterAttack
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string AtkBonus { get; set; } = string.Empty;
    public string DamageType { get; set; } = string.Empty;
    public Character? Character { get; set; }
}
