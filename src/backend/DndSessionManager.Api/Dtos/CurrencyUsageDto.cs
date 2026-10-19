namespace DndSessionManager.Api.Dtos;

// Where a coin is still in use, so deleting it can be blocked (shop prices)
// or warned about (coins in characters' purses) in plain words.
public record CurrencyUsageDto(IReadOnlyList<CurrencyUsageShopItemDto> ShopItems, int CharactersHolding, int TotalHeld);

public record CurrencyUsageShopItemDto(string Shop, string Item);
