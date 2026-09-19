using Microsoft.AspNetCore.Http;

namespace DndSessionManager.Api.Storage;

public interface IMonsterFileStorage
{
    Task<string> SaveAsync(IFormFile file);
    void Delete(string fileUrl);
    Task<(Stream Stream, string ContentType)?> OpenAsync(string storedFileName);
}
