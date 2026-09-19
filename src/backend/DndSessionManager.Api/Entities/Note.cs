namespace DndSessionManager.Api.Entities;

// Private notebook pages, per person per game — FA-08 "Notizen (privat, pro
// Person)". Deliberately NOT per-character: a note belongs to the real person
// (DM or a specific player), so it survives a player switching characters.
// There's no auth/identity system yet, so OwnerName is a free string ("DM" or
// a player's name) rather than a real user FK — same demo-mode convention as
// Quote's PlayerName attribution.
//
// A person can have many pages (Title distinguishes them), each freely
// editable independent of any particular session — Title defaults to the
// current session's label ("Session 3") for convenience, but that's just a
// suggested string, not a real Session FK, so a page never gets locked to
// "only visible during that session."
public class Note
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public Game? Game { get; set; }
}
