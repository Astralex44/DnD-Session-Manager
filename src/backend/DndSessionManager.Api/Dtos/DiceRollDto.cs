using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

// EnteredByOther: true when someone else (the DM) typed this roll in for you.
public record DiceRollDto(Guid Id, string Expression, string Dice, int Total, bool IsPhysical, bool EnteredByOther, DateTime CreatedAt);

public class RollDiceDto
{
    // d4–d20 only — no d100 (deliberate non-goal).
    [Required] public int Sides { get; set; }
    [Range(1, 20)] public int Count { get; set; } = 1;
    [Range(-50, 50)] public int Modifier { get; set; }
}

public class RecordPhysicalRollDto
{
    [MaxLength(100)] public string Expression { get; set; } = string.Empty;
    [Range(-1000, 1000)] public int Total { get; set; }

    // DM only: put the roll into this player's history instead of your own.
    public Guid? ForUserId { get; set; }
}
