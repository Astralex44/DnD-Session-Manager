using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class GameTimerFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : IGameTimerFacade
{
    public async Task<IReadOnlyList<GameTimerDto>> GetTimersForGameAsync(Guid gameId) =>
        (await unitOfWork.GameTimers.GetByGameIdAsync(gameId)).Select(ToDto).ToList();

    public async Task<GameTimerDto> CreateTimerAsync(Guid gameId, CreateGameTimerDto input)
    {
        var now = DateTime.UtcNow;
        var timer = new GameTimer
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Label = input.Label.Trim(),
            EndsAt = now.AddSeconds(input.DurationSeconds),
            CreatedAt = now,
        };

        await unitOfWork.GameTimers.AddAsync(timer);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "timers");
        return ToDto(timer);
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

    private static GameTimerDto ToDto(GameTimer timer) => new(timer.Id, timer.Label, timer.EndsAt);
}
