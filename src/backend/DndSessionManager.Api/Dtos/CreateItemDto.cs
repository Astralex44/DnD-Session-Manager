using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateItemDto
{
    [MaxLength(100)] public string Category { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Range(0, 999999)] public int Quantity { get; set; } = 1;
    [Range(0, 99999)] public decimal Weight { get; set; }
    public string Description { get; set; } = string.Empty;
}
