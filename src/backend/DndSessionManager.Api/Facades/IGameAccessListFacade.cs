using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IGameAccessListFacade
{
    Task<GameAccessListDto> GetAccessListAsync(Guid gameId);

    // Null when the handle is empty after normalizing, already invited, or
    // already belongs to a member of this game.
    Task<GameInviteDto?> AddInviteAsync(Guid gameId, CreateGameInviteDto input);
    Task<bool> RemoveInviteAsync(Guid gameId, Guid inviteId);

    // Players only — the DM can't remove themselves (or another DM) here.
    Task<bool> RemoveMemberAsync(Guid gameId, Guid memberId);
}
