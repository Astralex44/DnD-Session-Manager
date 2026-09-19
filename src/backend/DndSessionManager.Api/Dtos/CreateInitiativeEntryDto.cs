using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateInitiativeEntryDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
    public bool IsMonster { get; set; }
}
