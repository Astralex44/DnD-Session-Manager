using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByDiscordIdAsync(string discordId);
}
