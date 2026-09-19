using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace DndSessionManager.Api.Dtos;

public class UpdateMonsterDto
{
    [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
    [Range(0, 10000)] public int DefaultHp { get; set; }
    public IFormFile? File { get; set; }
}
