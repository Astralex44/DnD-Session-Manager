using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class AuthFacade(IUnitOfWork unitOfWork) : IAuthFacade
{
    public async Task<(User User, GameMember Membership)> FindOrCreateUserAsync(string discordId, string username, string? avatarUrl)
    {
        var user = await unitOfWork.Users.GetByDiscordIdAsync(discordId);
        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                DiscordId = discordId,
                Username = username,
                AvatarUrl = avatarUrl,
                CreatedAt = DateTime.UtcNow,
            };
            await unitOfWork.Users.AddAsync(user);
        }
        else
        {
            // Discord username/avatar can change between logins — keep it current.
            user.Username = username;
            user.AvatarUrl = avatarUrl;
        }

        var membership = await unitOfWork.GameMembers.GetByGameAndUserAsync(DemoGame.Id, user.Id);
        if (membership is null)
        {
            // First person into an empty game becomes Dm; everyone after
            // defaults to Player. No UI yet to change this (see GameMember.cs).
            var existingMemberCount = await unitOfWork.GameMembers.CountByGameAsync(DemoGame.Id);
            membership = new GameMember
            {
                Id = Guid.NewGuid(),
                GameId = DemoGame.Id,
                UserId = user.Id,
                Role = existingMemberCount == 0 ? GameMemberRole.Dm : GameMemberRole.Player,
                CreatedAt = DateTime.UtcNow,
            };
            await unitOfWork.GameMembers.AddAsync(membership);
        }

        await unitOfWork.SaveChangesAsync();
        return (user, membership);
    }

    public async Task<(User User, GameMember Membership)?> GetMeAsync(Guid userId)
    {
        var user = await unitOfWork.Users.GetByIdAsync(userId);
        if (user is null) return null;

        var membership = await unitOfWork.GameMembers.GetByGameAndUserAsync(DemoGame.Id, userId);
        return membership is null ? null : (user, membership);
    }
}
