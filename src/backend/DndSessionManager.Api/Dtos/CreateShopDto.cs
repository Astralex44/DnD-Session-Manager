using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateShopDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}
