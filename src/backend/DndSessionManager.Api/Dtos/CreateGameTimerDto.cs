using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateGameTimerDto
{
    [Required, MaxLength(200)] public string Label { get; set; } = string.Empty;
    [Range(1, 24 * 60 * 60)] public int DurationSeconds { get; set; } = 60;

    // Empty = everyone at the table.
    public List<Guid> CharacterIds { get; set; } = [];
}
