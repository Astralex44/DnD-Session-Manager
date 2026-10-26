namespace DndSessionManager.Api.Entities;

public enum ShopSaleMode
{
    SharedStock,
    PerPlayerLimited,
}

public class ShopItem
{
    public Guid Id { get; set; }
    public Guid ShopId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;

    // One of ShopItemCategories.All; carried over to the buyer's inventory.
    public string Category { get; set; } = ShopItemCategories.Miscellaneous;
    public decimal Weight { get; set; }
    public ShopSaleMode SaleMode { get; set; }

    // SharedStock: total units available across all buyers, decrements on every
    // purchase, null = unlimited. PerPlayerLimited: not used for availability —
    // MaxPerCharacter governs it instead, no shared counter needed (see
    // wiki/Decision-Log.md "Shop: shared stock vs. per-player limit").
    public int? StockQuantity { get; set; }

    // PerPlayerLimited only: max total units a single character may ever buy of
    // this item. Checked against that character's own purchase history, not a
    // shared counter.
    public int? MaxPerCharacter { get; set; }

    public Shop? Shop { get; set; }
    public ICollection<ShopItemPrice> Prices { get; set; } = new List<ShopItemPrice>();
}
