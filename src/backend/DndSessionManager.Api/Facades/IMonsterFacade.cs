using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IMonsterFacade
{
    Task<IReadOnlyList<MonsterDto>> GetMonstersForGameAsync(Guid gameId);
    Task<MonsterDto?> GetMonsterAsync(Guid gameId, Guid monsterId);
    Task<MonsterDto> CreateMonsterAsync(Guid gameId, CreateMonsterDto input);
    Task<MonsterDto?> UpdateMonsterAsync(Guid gameId, Guid monsterId, UpdateMonsterDto input);
    Task<bool> DeleteMonsterAsync(Guid gameId, Guid monsterId);
}
