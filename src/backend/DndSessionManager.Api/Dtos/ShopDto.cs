namespace DndSessionManager.Api.Dtos;

public record ShopDto(
    Guid Id,
    Guid GameId,
    string Name,
    string Description,
    string Location,
    IReadOnlyList<ShopItemDto> Items,
    IReadOnlyList<ShopShareDto> Shares);
