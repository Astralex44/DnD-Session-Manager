using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class InitiativeFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : IInitiativeFacade
{
    public async Task<InitiativeDto> GetInitiativeAsync(Guid gameId)
    {
        var state = await GetOrCreateStateAsync(gameId);
        var entries = await unitOfWork.InitiativeEntries.GetByGameIdAsync(gameId);
        return ToDto(state, entries);
    }

    public async Task<InitiativeDto> AddEntryAsync(Guid gameId, CreateInitiativeEntryDto input)
    {
        var entry = new InitiativeEntry
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = input.Name.Trim(),
            Value = input.Value,
            IsMonster = input.IsMonster,
            IsActive = false,
            CreatedAt = DateTime.UtcNow,
        };
        await unitOfWork.InitiativeEntries.AddAsync(entry);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "initiative");

        return await GetInitiativeAsync(gameId);
    }

    public async Task<InitiativeDto> RemoveEntryAsync(Guid gameId, Guid entryId)
    {
        var entry = await unitOfWork.InitiativeEntries.GetByIdAsync(entryId);
        if (entry is not null && entry.GameId == gameId)
        {
            unitOfWork.InitiativeEntries.Remove(entry);
            await unitOfWork.SaveChangesAsync();
            await broadcaster.NotifyAsync(gameId, "initiative");
        }

        return await GetInitiativeAsync(gameId);
    }

    public async Task<InitiativeDto> NextTurnAsync(Guid gameId)
    {
        var state = await GetOrCreateStateAsync(gameId);
        var entries = (await unitOfWork.InitiativeEntries.GetByGameIdAsync(gameId)).ToList();

        if (entries.Count > 0)
        {
            var currentIndex = entries.FindIndex(e => e.IsActive);
            var nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % entries.Count;

            if (currentIndex >= 0) entries[currentIndex].IsActive = false;
            if (currentIndex >= 0 && nextIndex == 0) state.Round += 1;
            entries[nextIndex].IsActive = true;

            await unitOfWork.SaveChangesAsync();
            await broadcaster.NotifyAsync(gameId, "initiative");
        }

        return ToDto(state, entries);
    }

    public async Task<InitiativeDto> ClearAsync(Guid gameId)
    {
        var state = await GetOrCreateStateAsync(gameId);
        var entries = await unitOfWork.InitiativeEntries.GetByGameIdAsync(gameId);
        foreach (var entry in entries) unitOfWork.InitiativeEntries.Remove(entry);
        state.Round = 1;

        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "initiative");
        return new InitiativeDto(state.Round, []);
    }

    private async Task<InitiativeState> GetOrCreateStateAsync(Guid gameId)
    {
        var state = await unitOfWork.InitiativeStates.GetByGameIdAsync(gameId);
        if (state is not null) return state;

        state = new InitiativeState { Id = Guid.NewGuid(), GameId = gameId, Round = 1 };
        await unitOfWork.InitiativeStates.AddAsync(state);
        await unitOfWork.SaveChangesAsync();
        return state;
    }

    private static InitiativeDto ToDto(InitiativeState state, IReadOnlyList<InitiativeEntry> entries) =>
        new(state.Round, entries.Select(e => new InitiativeEntryDto(e.Id, e.Name, e.Value, e.IsMonster, e.IsActive)).ToList());
}
