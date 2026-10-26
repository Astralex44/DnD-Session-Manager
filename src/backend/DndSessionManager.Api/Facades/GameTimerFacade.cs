using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class GameTimerFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : IGameTimerFacade
{
    // The DM sees every timer; a player sees timers for everyone plus the ones
    // aimed at a character they own — filtered here, not in the client.
    public async Task<IReadOnlyList<GameTimerDto>> GetTimersForGameAsync(Guid gameId, GameCaller caller)
    {
        var timers = await unitOfWork.GameTimers.GetByGameIdAsync(gameId);
        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        if (caller.IsDm) return timers.Select(timer => ToDto(timer, characterNames)).ToList();

        var own = characters.Where(c => c.OwnerUserId == caller.UserId).Select(c => c.Id).ToHashSet();
        return timers
            .Where(timer => timer.Targets.Count == 0 || timer.Targets.Any(target => own.Contains(target.CharacterId)))
            .Select(timer => ToDto(timer, characterNames))
            .ToList();
    }

    // Null when a target character isn't in this game.
    public async Task<GameTimerDto?> CreateTimerAsync(Guid gameId, CreateGameTimerDto input)
    {
        var characters = await unitOfWork.Characters.GetByGameIdAsync(gameId);
        var characterNames = characters.ToDictionary(c => c.Id, c => c.Name);
        var targetIds = input.CharacterIds.Distinct().ToList();
        if (!targetIds.All(characterNames.ContainsKey)) return null;

        var now = DateTime.UtcNow;
        var timer = new GameTimer
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Label = input.Label.Trim(),
            EndsAt = now.AddSeconds(input.DurationSeconds),
            CreatedAt = now,
        };
        foreach (var characterId in targetIds)
        {
            timer.Targets.Add(new GameTimerTarget { Id = Guid.NewGuid(), TimerId = timer.Id, CharacterId = characterId });
        }

        await unitOfWork.GameTimers.AddAsync(timer);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "timers");
        return ToDto(timer, characterNames);
    }

    public async Task<bool> DeleteTimerAsync(Guid gameId, Guid timerId)
    {
        var timer = await unitOfWork.GameTimers.GetByIdAsync(timerId);
        if (timer is null || timer.GameId != gameId) return false;

        unitOfWork.GameTimers.Remove(timer);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "timers");
        return true;
    }

    private static GameTimerDto ToDto(GameTimer timer, IReadOnlyDictionary<Guid, string> characterNames) => new(
        timer.Id, timer.Label, timer.EndsAt,
        timer.Targets
            .Select(target => new GameTimerTargetDto(target.CharacterId, characterNames.GetValueOrDefault(target.CharacterId, "Unknown")))
            .OrderBy(target => target.Name)
            .ToList());
}
