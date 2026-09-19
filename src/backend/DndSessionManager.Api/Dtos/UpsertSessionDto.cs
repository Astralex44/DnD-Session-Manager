namespace DndSessionManager.Api.Dtos;

public class UpsertSessionDto
{
    public string Title { get; set; } = string.Empty;
    public DateTime? ScheduledAt { get; set; }
    public string Notes { get; set; } = string.Empty;
}
