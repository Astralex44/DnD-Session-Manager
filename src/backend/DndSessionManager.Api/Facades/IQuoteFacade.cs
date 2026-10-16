using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IQuoteFacade
{
    // Players get shared quotes only; the DM gets all of them (FA-10).
    Task<IReadOnlyList<QuoteDto>> GetQuotesForGameAsync(Guid gameId, GameCaller caller);
    Task<QuoteDto> CreateQuoteAsync(Guid gameId, CreateQuoteDto input);
    Task<QuoteDto?> ToggleSharedAsync(Guid gameId, Guid quoteId);
    Task<QuoteDto?> SetSessionAsync(Guid gameId, Guid quoteId, Guid? sessionId);
    Task<QuoteDto?> SetCharacterAsync(Guid gameId, Guid quoteId, Guid? characterId);
    Task<bool> DeleteQuoteAsync(Guid gameId, Guid quoteId);
}
