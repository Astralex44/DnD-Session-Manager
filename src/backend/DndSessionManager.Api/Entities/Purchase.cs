namespace DndSessionManager.Api.Entities;

public class Purchase
{
    public Guid Id { get; set; }
    public Guid ShopItemId { get; set; }
    public Guid CharacterId { get; set; }
    public int Quantity { get; set; }
    public DateTime PurchasedAt { get; set; }
    public ShopItem? ShopItem { get; set; }
    public Character? Character { get; set; }
}
