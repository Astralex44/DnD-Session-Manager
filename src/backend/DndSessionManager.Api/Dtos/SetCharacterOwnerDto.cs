namespace DndSessionManager.Api.Dtos;

public class SetCharacterOwnerDto
{
    // A member of the game, or null to unassign.
    public Guid? UserId { get; set; }
}
