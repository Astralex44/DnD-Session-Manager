using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface ICurrencyDenominationRepository : IRepository<CurrencyDenomination>
{
    Task<IReadOnlyList<CurrencyDenomination>> GetByGameIdAsync(Guid gameId);
}
