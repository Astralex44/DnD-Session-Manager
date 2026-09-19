namespace DndSessionManager.Api.Entities;

public class CharacterItem
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal Weight { get; set; }
    public string Description { get; set; } = string.Empty;
    public Character? Character { get; set; }
}
