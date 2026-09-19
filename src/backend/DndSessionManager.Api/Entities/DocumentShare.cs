namespace DndSessionManager.Api.Entities;

// Additive/open sharing: adding a share doesn't require being the DM — any
// character already on a document's share list can add another (simulates
// physically handing a found book/map to someone else). Hidden/Locked are
// DM-driven fog-of-war controls that only really apply to Maps; Books just
// leave them at their defaults.
public class DocumentShare
{
    public Guid Id { get; set; }
    public Guid DocumentId { get; set; }
    public Guid CharacterId { get; set; }
    public bool Hidden { get; set; }
    public bool Locked { get; set; }
    public Document? Document { get; set; }
    public Character? Character { get; set; }
}
