namespace DndSessionManager.Api.Entities;

public class ShopItemPrice
{
    public Guid Id { get; set; }
    public Guid ShopItemId { get; set; }
    public Guid CurrencyDenominationId { get; set; }
    public int Amount { get; set; }
    public ShopItem? ShopItem { get; set; }
    public CurrencyDenomination? CurrencyDenomination { get; set; }
}
