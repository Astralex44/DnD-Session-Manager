using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class SetShopSaleModeDto
{
    // "SharedStock" or "PerPlayerLimited" — applied to every item in the shop.
    [Required] public string SaleMode { get; set; } = string.Empty;
}
