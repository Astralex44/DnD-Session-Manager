namespace DndSessionManager.Api.Dtos;

public record GameTimerDto(Guid Id, string Label, DateTime EndsAt);
