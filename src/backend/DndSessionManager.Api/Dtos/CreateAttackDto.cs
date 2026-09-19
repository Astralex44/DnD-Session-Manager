using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateAttackDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [MaxLength(50)] public string AtkBonus { get; set; } = string.Empty;
    [MaxLength(100)] public string DamageType { get; set; } = string.Empty;
}
