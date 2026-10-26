namespace DndSessionManager.Api.Dtos;

// Targets empty = a timer for everyone.
public record GameTimerDto(Guid Id, string Label, DateTime EndsAt, IReadOnlyList<GameTimerTargetDto> Targets);

public record GameTimerTargetDto(Guid CharacterId, string Name);
