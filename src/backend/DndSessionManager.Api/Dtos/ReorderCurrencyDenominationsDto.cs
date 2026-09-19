namespace DndSessionManager.Api.Dtos;

public record ReorderCurrencyDenominationsDto(IReadOnlyList<Guid> OrderedIds);
