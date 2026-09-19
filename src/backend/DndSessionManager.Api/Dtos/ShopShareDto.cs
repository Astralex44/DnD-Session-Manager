namespace DndSessionManager.Api.Dtos;

public record ShopShareDto(Guid Id, Guid CharacterId, string CharacterName, bool Hidden, bool Locked);
