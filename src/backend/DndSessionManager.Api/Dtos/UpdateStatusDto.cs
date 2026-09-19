using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class UpdateStatusDto
{
    [Required, MaxLength(30)] public string Status { get; set; } = string.Empty;
}
