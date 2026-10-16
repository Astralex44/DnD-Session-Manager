using DndSessionManager.Api.Entities;

namespace DndSessionManager.Api.Repositories;

public interface INoteRepository : IRepository<Note>
{
    // aboutCharacterId null → the person's own notebook; set → their (the
    // DM's) notebook on that character.
    Task<IReadOnlyList<Note>> GetByOwnerAsync(Guid gameId, Guid ownerUserId, Guid? aboutCharacterId);

    // Pre-login notes nobody has adopted yet, by their old free-text bucket.
    Task<IReadOnlyList<Note>> GetUnclaimedByOwnerNameAsync(Guid gameId, string ownerName);
}
