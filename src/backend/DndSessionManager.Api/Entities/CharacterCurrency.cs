namespace DndSessionManager.Api.Entities;

public class CharacterCurrency
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public Guid CurrencyDenominationId { get; set; }
    public int Quantity { get; set; }
    public Character? Character { get; set; }
    public CurrencyDenomination? CurrencyDenomination { get; set; }
}
