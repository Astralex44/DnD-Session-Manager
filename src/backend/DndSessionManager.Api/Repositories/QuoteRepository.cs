using DndSessionManager.Api.Data;
using DndSessionManager.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace DndSessionManager.Api.Repositories;

public class QuoteRepository : IQuoteRepository
{
    private readonly AppDbContext _context;

    public QuoteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Quote?> GetByIdAsync(Guid id) =>
        await _context.Quotes.Include(q => q.Session).Include(q => q.Character).FirstOrDefaultAsync(q => q.Id == id);

    public async Task<IReadOnlyList<Quote>> GetAllAsync() =>
        await _context.Quotes.ToListAsync();

    public async Task<IReadOnlyList<Quote>> GetByGameIdAsync(Guid gameId) =>
        await _context.Quotes
            .Include(q => q.Session)
            .Include(q => q.Character)
            .Where(q => q.GameId == gameId)
            .OrderByDescending(q => q.CreatedAt)
            .ToListAsync();

    public async Task AddAsync(Quote entity) =>
        await _context.Quotes.AddAsync(entity);

    public void Remove(Quote entity) =>
        _context.Quotes.Remove(entity);
}
