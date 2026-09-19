using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpsertCurrencyDenominationDto
{
    [Required, MaxLength(50)] public string Name { get; set; } = string.Empty;
    [Required, MaxLength(10)] public string Abbreviation { get; set; } = string.Empty;
    [Required, MaxLength(20)] public string Color { get; set; } = string.Empty;
    [Range(1, 1000000)] public int Value { get; set; } = 1;
}
