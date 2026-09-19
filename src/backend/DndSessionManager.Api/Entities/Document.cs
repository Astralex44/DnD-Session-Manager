namespace DndSessionManager.Api.Entities;

// Unifies what used to be separate Map and Book entities — both are just a
// shareable file with a name, distinguished by Type. Room for more types
// later (handouts, letters, ...) without a new entity each time.
public class Document
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public DocumentType Type { get; set; }
    public string Name { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public Game? Game { get; set; }
    public ICollection<DocumentShare> Shares { get; set; } = new List<DocumentShare>();
}
