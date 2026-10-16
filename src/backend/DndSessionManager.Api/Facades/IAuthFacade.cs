using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Facades;

public interface IAuthFacade
{
    Task<(User User, GameMember Membership)> FindOrCreateUserAsync(string discordId, string username, string? avatarUrl);
    Task<(User User, GameMember Membership)?> GetMeAsync(Guid userId);
}
