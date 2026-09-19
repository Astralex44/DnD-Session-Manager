namespace DndSessionManager.Api.Entities;

public class CurrencyDenomination
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Abbreviation { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public int Value { get; set; }
    public int SortOrder { get; set; }
    public Game? Game { get; set; }
}
