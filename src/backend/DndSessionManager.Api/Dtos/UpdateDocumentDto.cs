using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DndSessionManager.Api.Dtos;

public class UpdateDocumentDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    public IFormFile? File { get; set; }
}
