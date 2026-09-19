namespace DndSessionManager.Api.Dtos;

public record PurchaseDto(
    Guid Id,
    Guid ShopItemId,
    string ShopItemName,
    Guid CharacterId,
    string CharacterName,
    int Quantity,
    DateTime PurchasedAt,
    IReadOnlyList<ShopItemPriceDto> TotalPaid);
