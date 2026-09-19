namespace DndSessionManager.Api.Entities;

// The live, HP-tracking copy of a monster in an active encounter — deliberately
// separate from Monster (see wiki/Entscheidungs-Log.md "Monster: Vorlage getrennt
// von Live-Kampfteilnehmer", also noted in monsters-books-sessions-state memory).
// MonsterId is optional: the DM can spawn an instance from a saved Monster
// template (Name/HpMax prefilled from it) or add an ad-hoc one on the spot,
// same freeform pattern as InitiativeEntry. Not session-scoped by FK — like
// Initiative and Timer, it's GameId-scoped only and cleared when the
// encounter ends, since Board isn't a session-gate.
public class SessionMonster
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Guid? MonsterId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int HpCurrent { get; set; }
    public int HpMax { get; set; }
    public DateTime CreatedAt { get; set; }
    public Game? Game { get; set; }
    public Monster? Monster { get; set; }
}
