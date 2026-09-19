using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

// Business logic lives here, not in the controller and not in the
// repository. The controller only handles HTTP concerns (status codes,
// model binding) and delegates everything else to this facade.
public class QuoteFacade : IQuoteFacade
{
    private readonly IUnitOfWork _unitOfWork;

    public QuoteFacade(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<QuoteDto>> GetQuotesForGameAsync(Guid gameId)
    {
        var quotes = await _unitOfWork.Quotes.GetByGameIdAsync(gameId);
        return quotes.Select(q => ToDto(q)).ToList();
    }

    public async Task<QuoteDto> CreateQuoteAsync(Guid gameId, CreateQuoteDto input)
    {
        var session = await ResolveSessionAsync(gameId, input.SessionId);
        var character = await ResolveCharacterAsync(gameId, input.CharacterId);

        var quote = new Quote
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Text = input.Text.Trim(),
            IsShared = false,
            CreatedAt = DateTime.UtcNow,
            SessionId = session?.Id,
            CharacterId = character?.Id,
        };

        await _unitOfWork.Quotes.AddAsync(quote);
        await _unitOfWork.SaveChangesAsync();

        return ToDto(quote, session, character);
    }

    public async Task<QuoteDto?> ToggleSharedAsync(Guid gameId, Guid quoteId)
    {
        var quote = await _unitOfWork.Quotes.GetByIdAsync(quoteId);
        if (quote is null || quote.GameId != gameId)
        {
            return null;
        }

        quote.IsShared = !quote.IsShared;
        await _unitOfWork.SaveChangesAsync();

        return ToDto(quote, quote.Session, quote.Character);
    }

    public async Task<QuoteDto?> SetSessionAsync(Guid gameId, Guid quoteId, Guid? sessionId)
    {
        var quote = await _unitOfWork.Quotes.GetByIdAsync(quoteId);
        if (quote is null || quote.GameId != gameId)
        {
            return null;
        }

        if (sessionId is not null)
        {
            var session = await _unitOfWork.Sessions.GetByIdAsync(sessionId.Value);
            if (session is null || session.GameId != gameId) return null;
            quote.SessionId = session.Id;
            await _unitOfWork.SaveChangesAsync();
            return ToDto(quote, session, quote.Character);
        }

        quote.SessionId = null;
        await _unitOfWork.SaveChangesAsync();
        return ToDto(quote, null, quote.Character);
    }

    public async Task<QuoteDto?> SetCharacterAsync(Guid gameId, Guid quoteId, Guid? characterId)
    {
        var quote = await _unitOfWork.Quotes.GetByIdAsync(quoteId);
        if (quote is null || quote.GameId != gameId)
        {
            return null;
        }

        if (characterId is not null)
        {
            var character = await _unitOfWork.Characters.GetByIdAsync(characterId.Value);
            if (character is null || character.GameId != gameId) return null;
            quote.CharacterId = character.Id;
            await _unitOfWork.SaveChangesAsync();
            return ToDto(quote, quote.Session, character);
        }

        quote.CharacterId = null;
        await _unitOfWork.SaveChangesAsync();
        return ToDto(quote, quote.Session, null);
    }

    public async Task<bool> DeleteQuoteAsync(Guid gameId, Guid quoteId)
    {
        var quote = await _unitOfWork.Quotes.GetByIdAsync(quoteId);
        if (quote is null || quote.GameId != gameId)
        {
            return false;
        }

        _unitOfWork.Quotes.Remove(quote);
        await _unitOfWork.SaveChangesAsync();

        return true;
    }

    private async Task<Session?> ResolveSessionAsync(Guid gameId, Guid? sessionId)
    {
        if (sessionId is not { } id) return null;
        var session = await _unitOfWork.Sessions.GetByIdAsync(id);
        return session is not null && session.GameId == gameId ? session : null;
    }

    private async Task<Character?> ResolveCharacterAsync(Guid gameId, Guid? characterId)
    {
        if (characterId is not { } id) return null;
        var character = await _unitOfWork.Characters.GetByIdAsync(id);
        return character is not null && character.GameId == gameId ? character : null;
    }

    private static QuoteDto ToDto(Quote quote, Session? session = null, Character? character = null)
    {
        session ??= quote.Session;
        character ??= quote.Character;
        return new(
            quote.Id, quote.GameId, quote.Text, quote.IsShared, quote.CreatedAt,
            quote.SessionId, session?.Number,
            quote.CharacterId, character?.Name, character?.PlayerName);
    }
}
