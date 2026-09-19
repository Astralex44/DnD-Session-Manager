using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IAccessLockFacade
{
    Task<AccessLockStatusDto> GetStatusAsync(Guid gameId, string resourceType, string resourceKey);

    // For redacting a *list* of resources (e.g. the character overview) in
    // one query instead of one lock lookup per row.
    Task<HashSet<string>> GetLockedKeysAsync(Guid gameId, string resourceType);
    Task<AccessCodeResultDto> SetCodeAsync(Guid gameId, string resourceType, string resourceKey, SetAccessCodeDto input);
    Task<bool> VerifyCodeAsync(Guid gameId, string resourceType, string resourceKey, string? code);
    Task<AccessCodeResultDto> RemoveCodeAsync(Guid gameId, string resourceType, string resourceKey, string code);
}
