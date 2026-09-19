namespace DndSessionManager.Api.Dtos;

public record DocumentDto(
    Guid Id,
    Guid GameId,
    string Type,
    string Name,
    string FileUrl,
    string OriginalFileName,
    DateTime UploadedAt,
    IReadOnlyList<DocumentShareDto> Shares);
