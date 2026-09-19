using System.ComponentModel.DataAnnotations;

namespace DndSessionManager.Api.Dtos;

public class CreateLevelSheetDto
{
    [Range(1, 20)] public int Level { get; set; }

    // Added to the previous active level sheet's HpMax to get this sheet's HpMax.
    // Ability scores no longer live on the level sheet (they're always-editable
    // Character fields now), so leveling up is just this plus ProficiencyBonus.
    public int HpToAdd { get; set; }
    [Range(1, 10)] public int ProficiencyBonus { get; set; }
    public bool MakeActive { get; set; } = true;
}
