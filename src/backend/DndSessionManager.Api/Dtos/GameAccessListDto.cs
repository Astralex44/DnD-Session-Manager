namespace DndSessionManager.Api.Dtos;

public record GameMemberDto(
    Guid Id,
    Guid UserId,
    string Username,
    string DiscordHandle,
    string? AvatarUrl,
    string Role,
    DateTime JoinedAt);

public record GameInviteDto(Guid Id, string DiscordHandle, DateTime CreatedAt);

// The DM's view of who's in (members) and who may join (pending invites).
public record GameAccessListDto(IReadOnlyList<GameMemberDto> Members, IReadOnlyList<GameInviteDto> Invites);
