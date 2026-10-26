namespace DndSessionManager.Api.Dtos;

public record ShopItemDto(
    Guid Id,
    string Name,
    string Description,
    string Icon,
    string Category,
    decimal Weight,
    string SaleMode,
    int? StockQuantity,
    int? MaxPerCharacter,
    IReadOnlyList<ShopItemPriceDto> Prices);
