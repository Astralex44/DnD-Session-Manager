using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateQuoteDto
{
    [Required]
    [MaxLength(2000)]
    public string Text { get; set; } = string.Empty;
    public Guid? SessionId { get; set; }
    public Guid? CharacterId { get; set; }
}
