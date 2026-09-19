namespace DndSessionManager.Api.Dtos;

public record DocumentShareDto(Guid Id, Guid CharacterId, string CharacterName, bool Hidden, bool Locked);
