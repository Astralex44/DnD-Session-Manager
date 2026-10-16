using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class GameInviteRepository(AppDbContext context) : IGameInviteRepository
{
    public Task<GameInvite?> GetByIdAsync(Guid id) =>
        context.GameInvites.FirstOrDefaultAsync(i => i.Id == id);

    public async Task<IReadOnlyList<GameInvite>> GetAllAsync() =>
        await context.GameInvites.ToListAsync();

    public async Task<IReadOnlyList<GameInvite>> GetByGameIdAsync(Guid gameId) => await context.GameInvites
        .Where(i => i.GameId == gameId)
        .OrderBy(i => i.DiscordHandle)
        .ToListAsync();

    public Task<GameInvite?> GetByGameAndHandleAsync(Guid gameId, string discordHandle) =>
        context.GameInvites.FirstOrDefaultAsync(i => i.GameId == gameId && i.DiscordHandle == discordHandle);

    public Task AddAsync(GameInvite entity) => context.GameInvites.AddAsync(entity).AsTask();
    public void Remove(GameInvite entity) => context.GameInvites.Remove(entity);
}
