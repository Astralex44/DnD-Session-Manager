namespace DndSessionManager.Api.Dtos;

public record ItemDto(Guid Id, string Category, string Name, int Quantity, decimal Weight, string Description);
