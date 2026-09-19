namespace DndSessionManager.Api.Entities;

public class ShopShare
{
    public Guid Id { get; set; }
    public Guid ShopId { get; set; }
    public Guid CharacterId { get; set; }
    public bool Hidden { get; set; }
    public bool Locked { get; set; }
    public Shop? Shop { get; set; }
    public Character? Character { get; set; }
}
