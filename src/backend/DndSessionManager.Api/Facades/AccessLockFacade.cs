using System.Security.Cryptography;
using DndSessionManager.Api.Dtos;
using DndSessionManager.Api.Entities;
using DndSessionManager.Api.Repositories;

namespace DndSessionManager.Api.Facades;

public class AccessLockFacade(IUnitOfWork unitOfWork) : IAccessLockFacade
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public async Task<AccessLockStatusDto> GetStatusAsync(Guid gameId, string resourceType, string resourceKey)
    {
        var existing = await unitOfWork.AccessLocks.GetByResourceAsync(gameId, resourceType, resourceKey);
        return new AccessLockStatusDto(existing is not null);
    }

    public async Task<AccessCodeResultDto> SetCodeAsync(Guid gameId, string resourceType, string resourceKey, SetAccessCodeDto input)
    {
        if (string.IsNullOrWhiteSpace(input.NewCode) || input.NewCode.Trim().Length < 4)
        {
            return new AccessCodeResultDto(false, "Code must be at least 4 characters.");
        }

        var existing = await unitOfWork.AccessLocks.GetByResourceAsync(gameId, resourceType, resourceKey);
        if (existing is not null)
        {
            if (!Matches(existing, input.CurrentCode))
            {
                return new AccessCodeResultDto(false, "Current code is incorrect.");
            }

            var (hash, salt) = Hash(input.NewCode.Trim());
            existing.CodeHash = hash;
            existing.CodeSalt = salt;
        }
        else
        {
            var (hash, salt) = Hash(input.NewCode.Trim());
            await unitOfWork.AccessLocks.AddAsync(new AccessLock
            {
                Id = Guid.NewGuid(),
                GameId = gameId,
                ResourceType = resourceType,
                ResourceKey = resourceKey,
                CodeHash = hash,
                CodeSalt = salt,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await unitOfWork.SaveChangesAsync();
        return new AccessCodeResultDto(true, null);
    }

    // No lock set at all = always allowed, so every existing caller (before
    // this feature existed) keeps working unchanged.
    public async Task<bool> VerifyCodeAsync(Guid gameId, string resourceType, string resourceKey, string? code)
    {
        var existing = await unitOfWork.AccessLocks.GetByResourceAsync(gameId, resourceType, resourceKey);
        return existing is null || Matches(existing, code);
    }

    public async Task<AccessCodeResultDto> RemoveCodeAsync(Guid gameId, string resourceType, string resourceKey, string code)
    {
        var existing = await unitOfWork.AccessLocks.GetByResourceAsync(gameId, resourceType, resourceKey);
        if (existing is null) return new AccessCodeResultDto(true, null);
        if (!Matches(existing, code)) return new AccessCodeResultDto(false, "Code is incorrect.");

        unitOfWork.AccessLocks.Remove(existing);
        await unitOfWork.SaveChangesAsync();
        return new AccessCodeResultDto(true, null);
    }

    private static bool Matches(AccessLock lockEntity, string? code)
    {
        if (string.IsNullOrEmpty(code)) return false;
        var salt = Convert.FromBase64String(lockEntity.CodeSalt);
        var expected = Convert.FromBase64String(lockEntity.CodeHash);
        var actual = Rfc2898DeriveBytes.Pbkdf2(code.Trim(), salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static (string Hash, string Salt) Hash(string code)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(code, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }
}
