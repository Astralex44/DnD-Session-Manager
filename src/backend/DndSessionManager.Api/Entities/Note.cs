namespace DndSessionManager.Api.Entities;

// Private notebook pages, per person per game — FA-08 "Notizen (privat, pro
// Person)". A note belongs to the account in OwnerUserId and nobody else ever
// reads it, the DM included. AboutCharacterId marks a page in the DM's running
// notebook on one player character (still the DM's own private note).
//
// OwnerName is the free-text bucket from before login existed ("DM", a
// player's name, or a character's name). Notes still carrying a null
// OwnerUserId are unclaimed and invisible until they're adopted: the "DM"
// bucket at the DM's login, player and character buckets when the DM assigns
// that character an owner (see NoteFacade.AdoptLegacyNotesAsync).
//
// A person can have many pages (Title distinguishes them), each freely
// editable independent of any particular session — Title defaults to the
// current session's label ("Session 3") for convenience, but that's just a
// suggested string, not a real Session FK.
public class Note
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid? OwnerUserId { get; set; }
    public Guid? AboutCharacterId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Game? Game { get; set; }
    public User? Owner { get; set; }
    public Character? AboutCharacter { get; set; }
}
