namespace DndSessionManager.Api.Dtos;

public record PurchaseResultDto(bool Success, string? Error, PurchaseDto? Purchase);
