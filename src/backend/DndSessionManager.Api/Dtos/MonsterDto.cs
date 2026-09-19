namespace DndSessionManager.Api.Dtos;

public record MonsterDto(
    Guid Id,
    Guid GameId,
    string Name,
    string FileUrl,
    string OriginalFileName,
    int DefaultHp,
    DateTime UploadedAt);
