namespace DndSessionManager.Api.Entities;

// Vorlage getrennt von Live-Kampfteilnehmer (siehe wiki/Entscheidungs-Log.md):
// this is a reusable template (name, PDF stat block, default HP), owned by the
// DM, spanning the whole game. The live, HP-tracking copy of a monster in an
// active encounter is a separate concept that belongs to the future Board.
public class Monster
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public int DefaultHp { get; set; }
    public DateTime UploadedAt { get; set; }
    public Game? Game { get; set; }
}
