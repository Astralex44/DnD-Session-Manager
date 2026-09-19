namespace DndSessionManager.Api.Dtos;

public record SessionDto(
    Guid Id,
    Guid GameId,
    int Number,
    string Title,
    DateTime? ScheduledAt,
    string Notes);
