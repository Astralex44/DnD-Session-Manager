using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;
using DndSessionManager.Api.Storage;

namespace DndSessionManager.Api.Facades;

public class MonsterFacade(IUnitOfWork unitOfWork, IMonsterFileStorage fileStorage) : IMonsterFacade
{
    public async Task<IReadOnlyList<MonsterDto>> GetMonstersForGameAsync(Guid gameId) =>
        (await unitOfWork.Monsters.GetByGameIdAsync(gameId)).Select(ToDto).ToList();

    public async Task<MonsterDto?> GetMonsterAsync(Guid gameId, Guid monsterId)
    {
        var monster = await GetOwnedMonsterAsync(gameId, monsterId);
        return monster is null ? null : ToDto(monster);
    }

    public async Task<MonsterDto> CreateMonsterAsync(Guid gameId, CreateMonsterDto input)
    {
        var fileUrl = await fileStorage.SaveAsync(input.File);
        var monster = new Monster
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            Name = input.Name.Trim(),
            FileUrl = fileUrl,
            OriginalFileName = input.File.FileName,
            DefaultHp = input.DefaultHp,
            UploadedAt = DateTime.UtcNow,
        };

        await unitOfWork.Monsters.AddAsync(monster);
        await unitOfWork.SaveChangesAsync();
        return ToDto(monster);
    }

    public async Task<MonsterDto?> UpdateMonsterAsync(Guid gameId, Guid monsterId, UpdateMonsterDto input)
    {
        var monster = await GetOwnedMonsterAsync(gameId, monsterId);
        if (monster is null) return null;

        monster.Name = input.Name.Trim();
        monster.DefaultHp = input.DefaultHp;

        if (input.File is not null)
        {
            var previousFileUrl = monster.FileUrl;
            monster.FileUrl = await fileStorage.SaveAsync(input.File);
            monster.OriginalFileName = input.File.FileName;
            fileStorage.Delete(previousFileUrl);
        }

        await unitOfWork.SaveChangesAsync();
        return ToDto(monster);
    }

    public async Task<bool> DeleteMonsterAsync(Guid gameId, Guid monsterId)
    {
        var monster = await GetOwnedMonsterAsync(gameId, monsterId);
        if (monster is null) return false;

        unitOfWork.Monsters.Remove(monster);
        await unitOfWork.SaveChangesAsync();
        fileStorage.Delete(monster.FileUrl);
        return true;
    }

    private async Task<Monster?> GetOwnedMonsterAsync(Guid gameId, Guid monsterId)
    {
        var monster = await unitOfWork.Monsters.GetByIdAsync(monsterId);
        return monster is not null && monster.GameId == gameId ? monster : null;
    }

    private static MonsterDto ToDto(Monster monster) => new(
        monster.Id, monster.GameId, monster.Name, monster.FileUrl, monster.OriginalFileName,
        monster.DefaultHp, monster.UploadedAt);
}
