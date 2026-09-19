using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DndSessionManager.Api.Dtos;

public class CreateDocumentDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Required] public string Type { get; set; } = string.Empty;
    [Required] public IFormFile File { get; set; } = null!;
}
