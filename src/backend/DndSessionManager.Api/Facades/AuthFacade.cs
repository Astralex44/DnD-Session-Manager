using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

// Login rules (NFA-05, decided 2026-10-16 — the DM's access list, not "first
// login wins"):
//   1. Discord ID matches Auth:DmDiscordId → Dm of the game.
//   2. Already a member → in, with whatever role they have.
//   3. Discord handle matches a GameInvite → becomes a Player, invite used up.
//   4. Anything else → null. Nothing is stored about strangers.
public class AuthFacade(IUnitOfWork unitOfWork, IConfiguration configuration) : IAuthFacade
{
    public async Task<(User User, GameMember Membership)?> SignInAsync(
        string discordId, string discordHandle, string displayName, string? avatarUrl)
    {
        var handle = GameInvite.NormalizeHandle(discordHandle);
        var dmDiscordId = configuration["Auth:DmDiscordId"];
        var isConfiguredDm = !string.IsNullOrEmpty(dmDiscordId) && dmDiscordId == discordId;

        var user = await unitOfWork.Users.GetByDiscordIdAsync(discordId);
        var membership = user is null ? null : await unitOfWork.GameMembers.GetByGameAndUserAsync(DemoGame.Id, user.Id);
        var invite = await unitOfWork.GameInvites.GetByGameAndHandleAsync(DemoGame.Id, handle);

        if (!isConfiguredDm && membership is null && invite is null) return null;

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                DiscordId = discordId,
                CreatedAt = DateTime.UtcNow,
            };
            await unitOfWork.Users.AddAsync(user);
        }

        // Discord handle/display name/avatar can change between logins — keep them current.
        user.DiscordHandle = handle;
        user.Username = displayName;
        user.AvatarUrl = avatarUrl;

        if (membership is null)
        {
            membership = new GameMember
            {
                Id = Guid.NewGuid(),
                GameId = DemoGame.Id,
                UserId = user.Id,
                Role = isConfiguredDm ? GameMemberRole.Dm : GameMemberRole.Player,
                CreatedAt = DateTime.UtcNow,
            };
            await unitOfWork.GameMembers.AddAsync(membership);
        }
        else if (isConfiguredDm)
        {
            membership.Role = GameMemberRole.Dm;
        }

        // Used up either way — a leftover invite for someone already in the
        // game would just show up as a stale "pending" entry on the DM's list.
        if (invite is not null) unitOfWork.GameInvites.Remove(invite);

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
