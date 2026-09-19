namespace DndSessionManager.Api.Dtos;

public class SetAccessCodeDto
{
    // Required if the resource is already locked — proves you're the one
    // who set the existing code before letting you change it.
    public string? CurrentCode { get; set; }
    public string NewCode { get; set; } = string.Empty;
}
