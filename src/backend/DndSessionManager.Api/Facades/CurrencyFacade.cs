using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class CurrencyFacade(IUnitOfWork unitOfWork) : ICurrencyFacade
{
    public async Task<IReadOnlyList<CurrencyDenominationDto>> GetDenominationsForGameAsync(Guid gameId) =>
        (await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId)).Select(ToDto).ToList();

    public async Task<CurrencyDenominationDto> CreateDenominationAsync(Guid gameId, UpsertCurrencyDenominationDto input)
    {
        var existing = await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId);
        var denomination = new CurrencyDenomination
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = input.Name.Trim(),
            Abbreviation = input.Abbreviation.Trim(),
            Color = input.Color.Trim(),
            Value = input.Value,
            SortOrder = existing.Count == 0 ? 0 : existing.Max(d => d.SortOrder) + 1,
        };
        await unitOfWork.CurrencyDenominations.AddAsync(denomination);
        await unitOfWork.SaveChangesAsync();
        return ToDto(denomination);
    }

    public async Task<CurrencyDenominationDto?> UpdateDenominationAsync(Guid gameId, Guid id, UpsertCurrencyDenominationDto input)
    {
        var denomination = await GetOwnedDenominationAsync(gameId, id);
        if (denomination is null) return null;

        denomination.Name = input.Name.Trim();
        denomination.Abbreviation = input.Abbreviation.Trim();
        denomination.Color = input.Color.Trim();
        denomination.Value = input.Value;

        await unitOfWork.SaveChangesAsync();
        return ToDto(denomination);
    }

    public async Task<bool> DeleteDenominationAsync(Guid gameId, Guid id)
    {
        var denomination = await GetOwnedDenominationAsync(gameId, id);
        if (denomination is null) return false;

        unitOfWork.CurrencyDenominations.Remove(denomination);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<IReadOnlyList<CurrencyDenominationDto>?> ReorderDenominationsAsync(Guid gameId, ReorderCurrencyDenominationsDto input)
    {
        var existing = await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId);
        if (existing.Count != input.OrderedIds.Count || !existing.All(d => input.OrderedIds.Contains(d.Id))) return null;

        var byId = existing.ToDictionary(d => d.Id);
        for (var i = 0; i < input.OrderedIds.Count; i++)
        {
            byId[input.OrderedIds[i]].SortOrder = i;
        }

        await unitOfWork.SaveChangesAsync();
        return (await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId)).Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<CharacterCurrencyDto>?> GetCharacterWalletAsync(Guid gameId, Guid characterId)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;

        var denominations = await unitOfWork.CurrencyDenominations.GetByGameIdAsync(gameId);
        var wallet = await unitOfWork.CharacterCurrencies.GetByCharacterIdAsync(characterId);
        var quantities = wallet.ToDictionary(c => c.CurrencyDenominationId, c => c.Quantity);

        return denominations
            .Select(d => new CharacterCurrencyDto(d.Id, d.Name, d.Abbreviation, d.Color, quantities.GetValueOrDefault(d.Id, 0)))
            .ToList();
    }

    public async Task<CharacterCurrencyDto?> SetCharacterCurrencyAsync(Guid gameId, Guid characterId, Guid denominationId, SetCharacterCurrencyDto input)
    {
        if (await GetOwnedCharacterAsync(gameId, characterId) is null) return null;
        var denomination = await GetOwnedDenominationAsync(gameId, denominationId);
        if (denomination is null) return null;

        var entry = await unitOfWork.CharacterCurrencies.GetByCharacterAndDenominationAsync(characterId, denominationId);
        if (entry is null)
        {
            entry = new CharacterCurrency { Id = Guid.NewGuid(), CharacterId = characterId, CurrencyDenominationId = denominationId };
            await unitOfWork.CharacterCurrencies.AddAsync(entry);
        }

        entry.Quantity = input.Quantity;
        await unitOfWork.SaveChangesAsync();
        return new CharacterCurrencyDto(denomination.Id, denomination.Name, denomination.Abbreviation, denomination.Color, entry.Quantity);
    }

    private async Task<CurrencyDenomination?> GetOwnedDenominationAsync(Guid gameId, Guid id)
    {
        var denomination = await unitOfWork.CurrencyDenominations.GetByIdAsync(id);
        return denomination is not null && denomination.GameId == gameId ? denomination : null;
    }

    private async Task<Character?> GetOwnedCharacterAsync(Guid gameId, Guid characterId)
    {
        var character = await unitOfWork.Characters.GetByIdAsync(characterId);
        return character is not null && character.GameId == gameId ? character : null;
    }

    private static CurrencyDenominationDto ToDto(CurrencyDenomination d) =>
        new(d.Id, d.GameId, d.Name, d.Abbreviation, d.Color, d.Value, d.SortOrder);
}
