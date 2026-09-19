using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateShopItemPriceDto
{
    [Required] public Guid DenominationId { get; set; }
    [Range(1, 1000000)] public int Amount { get; set; }
}
