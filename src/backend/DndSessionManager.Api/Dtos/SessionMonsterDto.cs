namespace DndSessionManager.Api.Dtos;

public record SessionMonsterDto(
    Guid Id,
    Guid GameId,
    Guid? MonsterId,
    string? MonsterFileUrl,
    string Name,
    int HpCurrent,
    int HpMax,
    DateTime CreatedAt);
