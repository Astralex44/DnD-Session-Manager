using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class DocumentRepository(AppDbContext context) : IDocumentRepository
{
    public Task<Document?> GetByIdAsync(Guid id) => context.Documents
        .Include(doc => doc.Shares)
        .FirstOrDefaultAsync(doc => doc.Id == id);

    public async Task<IReadOnlyList<Document>> GetAllAsync() =>
        await context.Documents.Include(doc => doc.Shares).ToListAsync();

    public async Task<IReadOnlyList<Document>> GetByGameIdAsync(Guid gameId) => await context.Documents
        .Where(doc => doc.GameId == gameId)
        .Include(doc => doc.Shares)
        .OrderBy(doc => doc.Name)
        .ToListAsync();

    public Task AddAsync(Document entity) => context.Documents.AddAsync(entity).AsTask();
    public void Remove(Document entity) => context.Documents.Remove(entity);
}
