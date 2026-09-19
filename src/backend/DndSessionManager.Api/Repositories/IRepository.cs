namespace DndSessionManager.Api.Repositories;

// Generic base so every entity-specific repository (IQuoteRepository,
// ICharacterRepository, ...) shares the same basic shape.
public interface IRepository<TEntity> where TEntity : class
{
    Task<TEntity?> GetByIdAsync(Guid id);
    Task<IReadOnlyList<TEntity>> GetAllAsync();
    Task AddAsync(TEntity entity);
    void Remove(TEntity entity);
}
