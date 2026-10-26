namespace DndSessionManager.Api.Entities;

public class Shop
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Where in the world the shop is ("Waterdeep, Dock Ward"). Free text, empty =
    // no location; the DM filters shops by it in Manage and on the Board.
    public string Location { get; set; } = string.Empty;
    public Game? Game { get; set; }
    public ICollection<ShopItem> Items { get; set; } = new List<ShopItem>();
    public ICollection<ShopShare> Shares { get; set; } = new List<ShopShare>();
}
