namespace DndSessionManager.Api.Entities;

public class CharacterSkill
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public string SkillName { get; set; } = string.Empty;
    public bool Proficient { get; set; }
    public Character? Character { get; set; }
}
