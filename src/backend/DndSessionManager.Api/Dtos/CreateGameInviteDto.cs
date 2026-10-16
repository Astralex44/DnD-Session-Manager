using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateGameInviteDto
{
    // The person's Discord username (not their display name) — "@" optional,
    // case doesn't matter.
    [Required]
    [MaxLength(50)]
    public string DiscordHandle { get; set; } = string.Empty;
}
