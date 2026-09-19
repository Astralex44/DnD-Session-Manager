using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IQuoteRepository : IRepository<Quote>
{
    Task<IReadOnlyList<Quote>> GetByGameIdAsync(Guid gameId);
}
