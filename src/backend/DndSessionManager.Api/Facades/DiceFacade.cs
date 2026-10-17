using System.Security.Cryptography;
using DndSessionManager.Api.Auth;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

// FA-06 + NFA-03 (hybrid play). Rolls happen on the server (so a history on
// one device matches another) and are always private: each person reads
// only their own last 5, the DM included. The DM can type in a physical roll
// *for* a player — it lands in the player's history, not the DM's.
public class DiceFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : IDiceFacade
{
    private const int HistoryLength = 5;
    private static readonly int[] AllowedSides = [4, 6, 8, 10, 12, 20];

    public async Task<IReadOnlyList<DiceRollDto>> GetHistoryAsync(Guid gameId, GameCaller caller) =>
        (await unitOfWork.DiceRolls.GetByGameAndUserAsync(gameId, caller.UserId))
            .Take(HistoryLength)
            .Select(r => ToDto(r, caller.UserId))
            .ToList();

    public async Task<DiceRollDto?> RollAsync(Guid gameId, GameCaller caller, RollDiceDto input)
    {
        if (!AllowedSides.Contains(input.Sides)) return null;

        var dice = Enumerable.Range(0, input.Count).Select(_ => RandomNumberGenerator.GetInt32(1, input.Sides + 1)).ToList();
        var modifier = input.Modifier switch { > 0 => $"+{input.Modifier}", < 0 => $"{input.Modifier}", _ => "" };
        var roll = new DiceRoll
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            UserId = caller.UserId,
            EnteredByUserId = caller.UserId,
            Expression = $"{input.Count}d{input.Sides}{modifier}",
            Dice = string.Join(",", dice),
            Total = dice.Sum() + input.Modifier,
            CreatedAt = DateTime.UtcNow,
        };
        await SaveAndTrimAsync(roll);
        return ToDto(roll, caller.UserId);
    }

    public async Task<(DiceRollDto? Roll, bool Forbidden)> RecordPhysicalAsync(Guid gameId, GameCaller caller, RecordPhysicalRollDto input)
    {
        var target = input.ForUserId ?? caller.UserId;
        if (target != caller.UserId)
        {
            if (!caller.IsDm) return (null, true);
            if (await unitOfWork.GameMembers.GetByGameAndUserAsync(gameId, target) is null) return (null, true);
        }

        var roll = new DiceRoll
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            UserId = target,
            EnteredByUserId = caller.UserId,
            Expression = string.IsNullOrWhiteSpace(input.Expression) ? "Physical roll" : input.Expression.Trim(),
            Total = input.Total,
            IsPhysical = true,
            CreatedAt = DateTime.UtcNow,
        };
        await SaveAndTrimAsync(roll);
        return (ToDto(roll, caller.UserId), false);
    }

    // Insert, then drop anything beyond the newest 5 for that person, in one
    // save. "dice" goes out like every other live event (no payload): each
    // client just refetches its *own* history, so a roll the DM enters for a
    // player shows up on that player's Board right away.
    private async Task SaveAndTrimAsync(DiceRoll roll)
    {
        await unitOfWork.DiceRolls.AddAsync(roll);
        var older = (await unitOfWork.DiceRolls.GetByGameAndUserAsync(roll.GameId, roll.UserId)).Skip(HistoryLength - 1);
        foreach (var stale in older) unitOfWork.DiceRolls.Remove(stale);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(roll.GameId, "dice");
    }

    private static DiceRollDto ToDto(DiceRoll r, Guid viewer) =>
        new(r.Id, r.Expression, r.Dice, r.Total, r.IsPhysical, r.EnteredByUserId != viewer && r.UserId == viewer, r.CreatedAt);
}
