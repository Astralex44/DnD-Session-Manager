using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id) =>
        context.Users.FirstOrDefaultAsync(u => u.Id == id);

    public async Task<IReadOnlyList<User>> GetAllAsync() =>
        await context.Users.ToListAsync();

    public Task<User?> GetByDiscordIdAsync(string discordId) =>
        context.Users.FirstOrDefaultAsync(u => u.DiscordId == discordId);

    public Task AddAsync(User entity) => context.Users.AddAsync(entity).AsTask();
    public void Remove(User entity) => context.Users.Remove(entity);
}
