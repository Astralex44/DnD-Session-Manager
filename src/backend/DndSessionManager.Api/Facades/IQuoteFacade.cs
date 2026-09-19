using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IQuoteFacade
{
    Task<IReadOnlyList<QuoteDto>> GetQuotesForGameAsync(Guid gameId);
    Task<QuoteDto> CreateQuoteAsync(Guid gameId, CreateQuoteDto input);
    Task<QuoteDto?> ToggleSharedAsync(Guid gameId, Guid quoteId);
    Task<QuoteDto?> SetSessionAsync(Guid gameId, Guid quoteId, Guid? sessionId);
    Task<QuoteDto?> SetCharacterAsync(Guid gameId, Guid quoteId, Guid? characterId);
    Task<bool> DeleteQuoteAsync(Guid gameId, Guid quoteId);
}
