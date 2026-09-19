using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class NoteRepository(AppDbContext context) : INoteRepository
{
    public Task<Note?> GetByIdAsync(Guid id) =>
        context.Notes.FirstOrDefaultAsync(note => note.Id == id);

    public async Task<IReadOnlyList<Note>> GetAllAsync() =>
        await context.Notes.ToListAsync();

    public async Task<IReadOnlyList<Note>> GetByGameAndOwnerAsync(Guid gameId, string ownerName) =>
        await context.Notes
            .Where(note => note.GameId == gameId && note.OwnerName == ownerName)
            .OrderByDescending(note => note.UpdatedAt)
            .ToListAsync();

    public Task AddAsync(Note entity) => context.Notes.AddAsync(entity).AsTask();
    public void Remove(Note entity) => context.Notes.Remove(entity);
}
