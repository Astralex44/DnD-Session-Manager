using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class CharacterCurrencyRepository(AppDbContext context) : ICharacterCurrencyRepository
{
    public Task<CharacterCurrency?> GetByIdAsync(Guid id) =>
        context.CharacterCurrencies.FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IReadOnlyList<CharacterCurrency>> GetAllAsync() =>
        await context.CharacterCurrencies.ToListAsync();

    public async Task<IReadOnlyList<CharacterCurrency>> GetByCharacterIdAsync(Guid characterId) => await context.CharacterCurrencies
        .Where(c => c.CharacterId == characterId)
        .ToListAsync();

    public Task<CharacterCurrency?> GetByCharacterAndDenominationAsync(Guid characterId, Guid denominationId) =>
        context.CharacterCurrencies.FirstOrDefaultAsync(c => c.CharacterId == characterId && c.CurrencyDenominationId == denominationId);

    public Task AddAsync(CharacterCurrency entity) => context.CharacterCurrencies.AddAsync(entity).AsTask();
    public void Remove(CharacterCurrency entity) => context.CharacterCurrencies.Remove(entity);
}
