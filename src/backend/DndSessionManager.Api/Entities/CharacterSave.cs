namespace DndSessionManager.Api.Entities;

public class CharacterSave
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public string Ability { get; set; } = string.Empty;
    public bool Proficient { get; set; }
    public Character? Character { get; set; }
}
