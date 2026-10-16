using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

// The DM's access list (NFA-05): who is in the game, and which Discord
// usernames are invited but haven't logged in yet. See AuthFacade for how an
// invite turns into a membership at login.
public class GameAccessListFacade(IUnitOfWork unitOfWork) : IGameAccessListFacade
{
    public async Task<GameAccessListDto> GetAccessListAsync(Guid gameId)
    {
        var members = await unitOfWork.GameMembers.GetByGameIdAsync(gameId);
        var invites = await unitOfWork.GameInvites.GetByGameIdAsync(gameId);
        return new GameAccessListDto(members.Select(ToDto).ToList(), invites.Select(ToDto).ToList());
    }

    public async Task<GameInviteDto?> AddInviteAsync(Guid gameId, CreateGameInviteDto input)
    {
        var handle = GameInvite.NormalizeHandle(input.DiscordHandle);
        if (handle.Length == 0) return null;
        if (await unitOfWork.GameInvites.GetByGameAndHandleAsync(gameId, handle) is not null) return null;

        var members = await unitOfWork.GameMembers.GetByGameIdAsync(gameId);
        if (members.Any(m => m.User?.DiscordHandle == handle)) return null;

        var invite = new GameInvite
        {
            Id = Guid.NewGuid(),
            GameId = gameId,
            DiscordHandle = handle,
            CreatedAt = DateTime.UtcNow,
        };
        await unitOfWork.GameInvites.AddAsync(invite);
        await unitOfWork.SaveChangesAsync();
        return ToDto(invite);
    }

    public async Task<bool> RemoveInviteAsync(Guid gameId, Guid inviteId)
    {
        var invite = await unitOfWork.GameInvites.GetByIdAsync(inviteId);
        if (invite is null || invite.GameId != gameId) return false;

        unitOfWork.GameInvites.Remove(invite);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveMemberAsync(Guid gameId, Guid memberId)
    {
        var member = await unitOfWork.GameMembers.GetByIdAsync(memberId);
        if (member is null || member.GameId != gameId || member.Role != GameMemberRole.Player) return false;

        unitOfWork.GameMembers.Remove(member);
        await unitOfWork.SaveChangesAsync();
        return true;
    }

    private static GameMemberDto ToDto(GameMember member) => new(
        member.Id,
        member.UserId,
        member.User?.Username ?? string.Empty,
        member.User?.DiscordHandle ?? string.Empty,
        member.User?.AvatarUrl,
        member.Role.ToString(),
        member.CreatedAt);

    private static GameInviteDto ToDto(GameInvite invite) => new(invite.Id, invite.DiscordHandle, invite.CreatedAt);
}
