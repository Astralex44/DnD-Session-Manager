using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Facades;

public interface IAuthFacade
{
    // Null when the person isn't the configured DM, isn't a member and has no
    // invite — the login is then refused (see AuthFacade for the rules).
    Task<(User User, GameMember Membership)?> SignInAsync(string discordId, string discordHandle, string displayName, string? avatarUrl);
    Task<(User User, GameMember Membership)?> GetMeAsync(Guid userId);
}
