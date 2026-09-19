using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpdateShopItemDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    [MaxLength(10)] public string Icon { get; set; } = string.Empty;
    [Required] public string SaleMode { get; set; } = "SharedStock";
    public int? StockQuantity { get; set; }
    public int? MaxPerCharacter { get; set; }
    public List<CreateShopItemPriceDto> Prices { get; set; } = [];
}
