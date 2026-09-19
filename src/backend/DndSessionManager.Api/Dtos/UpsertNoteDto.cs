using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpsertNoteDto
{
    [Required, MaxLength(200)] public string Title { get; set; } = string.Empty;
    [MaxLength(20000)] public string Text { get; set; } = string.Empty;
}
