namespace DndSessionManager.Api.Dtos;

public record MeDto(Guid UserId, string Username, string? AvatarUrl, Guid GameId, string Role);
