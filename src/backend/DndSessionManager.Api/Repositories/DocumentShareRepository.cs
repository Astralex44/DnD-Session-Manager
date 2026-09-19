using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class DocumentShareRepository(AppDbContext context) : IDocumentShareRepository
{
    public Task<DocumentShare?> GetByIdAsync(Guid id) =>
        context.DocumentShares.FirstOrDefaultAsync(share => share.Id == id);

    public async Task<IReadOnlyList<DocumentShare>> GetAllAsync() =>
        await context.DocumentShares.ToListAsync();

    public Task<DocumentShare?> GetByDocumentAndCharacterAsync(Guid documentId, Guid characterId) =>
        context.DocumentShares.FirstOrDefaultAsync(share => share.DocumentId == documentId && share.CharacterId == characterId);

    public async Task<IReadOnlyList<DocumentShare>> GetByCharacterIdAsync(Guid characterId) =>
        await context.DocumentShares.Where(share => share.CharacterId == characterId).ToListAsync();

    public Task AddAsync(DocumentShare entity) => context.DocumentShares.AddAsync(entity).AsTask();
    public void Remove(DocumentShare entity) => context.DocumentShares.Remove(entity);
}
