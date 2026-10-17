namespace DndSessionManager.Api.Dtos;

// Names only — who's at the table, without any of their sheet.
public record PartyMemberDto(Guid CharacterId, string Name, string? OwnerUsername);
