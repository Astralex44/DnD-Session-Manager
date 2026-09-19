namespace DndSessionManager.Api.Dtos;

public record SpellSlotDto(Guid Id, int Level, int Total, int Expended);
