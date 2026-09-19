using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Hubs;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class SessionMonsterFacade(IUnitOfWork unitOfWork, IGameEventsBroadcaster broadcaster) : ISessionMonsterFacade
{
    public async Task<IReadOnlyList<SessionMonsterDto>> GetForGameAsync(Guid gameId)
    {
        var monsters = await unitOfWork.SessionMonsters.GetByGameIdAsync(gameId);
        return monsters.Select(ToDto).ToList();
    }

    public async Task<SessionMonsterDto?> AddAsync(Guid gameId, CreateSessionMonsterDto input)
    {
        Monster? template = null;
        if (input.MonsterId is { } monsterId)
        {
            template = await unitOfWork.Monsters.GetByIdAsync(monsterId);
            if (template is null || template.GameId != gameId) return null;
        }

        var name = input.Name?.Trim();
        if (string.IsNullOrEmpty(name)) name = template?.Name;
        if (string.IsNullOrEmpty(name)) return null;

        var hpMax = input.HpMax ?? template?.DefaultHp ?? 0;

        var monster = new SessionMonster
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            MonsterId = template?.Id,
            Name = name,
            HpCurrent = hpMax,
            HpMax = hpMax,
            CreatedAt = DateTime.UtcNow,
        };
        await unitOfWork.SessionMonsters.AddAsync(monster);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "monsters");

        var saved = await unitOfWork.SessionMonsters.GetByIdAsync(monster.Id);
        return saved is null ? null : ToDto(saved);
    }

    public async Task<SessionMonsterDto?> UpdateHpAsync(Guid gameId, Guid id, UpdateSessionMonsterHpDto input)
    {
        var monster = await unitOfWork.SessionMonsters.GetByIdAsync(id);
        if (monster is null || monster.GameId != gameId) return null;

        monster.HpCurrent = input.HpCurrent;
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "monsters");
        return ToDto(monster);
    }

    public async Task<bool> RemoveAsync(Guid gameId, Guid id)
    {
        var monster = await unitOfWork.SessionMonsters.GetByIdAsync(id);
        if (monster is null || monster.GameId != gameId) return false;

        unitOfWork.SessionMonsters.Remove(monster);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "monsters");
        return true;
    }

    public async Task ClearAsync(Guid gameId)
    {
        var monsters = await unitOfWork.SessionMonsters.GetByGameIdAsync(gameId);
        foreach (var monster in monsters) unitOfWork.SessionMonsters.Remove(monster);
        await unitOfWork.SaveChangesAsync();
        await broadcaster.NotifyAsync(gameId, "monsters");
    }

    private static SessionMonsterDto ToDto(SessionMonster monster) => new(
        monster.Id,
        monster.GameId,
        monster.MonsterId,
        monster.Monster?.FileUrl,
        monster.Name,
        monster.HpCurrent,
        monster.HpMax,
        monster.CreatedAt);
}
