using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateSpellDto
{
    [Range(0, 9)] public int Level { get; set; }
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    public bool Prepared { get; set; }
    public string? Description { get; set; }
    public bool IsHomebrew { get; set; }
}
