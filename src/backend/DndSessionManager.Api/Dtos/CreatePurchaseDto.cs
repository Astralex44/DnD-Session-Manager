using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreatePurchaseDto
{
    [Required] public Guid CharacterId { get; set; }
    [Range(1, 1000000)] public int Quantity { get; set; } = 1;

    // Optional — a DM negotiating a price mid-session can charge something
    // other than the shop item's configured price for this one sale. Null or
    // empty means "use the item's normal price," which is also what every
    // existing caller (before this field existed) gets.
    public List<PurchasePriceOverrideDto>? OverridePrices { get; set; }
}
