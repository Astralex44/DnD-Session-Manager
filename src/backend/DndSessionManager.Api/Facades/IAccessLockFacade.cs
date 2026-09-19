using DndSessionManager.Api.Dtos;

namespace DndSessionManager.Api.Facades;

public interface IAccessLockFacade
{
    Task<AccessLockStatusDto> GetStatusAsync(Guid gameId, string resourceType, string resourceKey);
    Task<AccessCodeResultDto> SetCodeAsync(Guid gameId, string resourceType, string resourceKey, SetAccessCodeDto input);
    Task<bool> VerifyCodeAsync(Guid gameId, string resourceType, string resourceKey, string? code);
    Task<AccessCodeResultDto> RemoveCodeAsync(Guid gameId, string resourceType, string resourceKey, string code);
}
