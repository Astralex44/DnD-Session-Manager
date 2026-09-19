namespace DndSessionManager.Api.Storage;

// Mirrors DocumentFileStorage — see the TODO(auth) note there, same applies
// here: this serving endpoint is open for now because there's no auth/session yet.
public class MonsterFileStorage(IWebHostEnvironment env) : IMonsterFileStorage
{
    private const string UrlPrefix = "/api/files/monsters/";
    private static readonly HashSet<string> AllowedExtensions = [".pdf"];

    private string RootDirectory => Path.Combine(env.ContentRootPath, "uploads", "monsters");

    public async Task<string> SaveAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new InvalidOperationException($"Unsupported file type '{extension}'. Allowed: {string.Join(", ", AllowedExtensions)}.");
        }

        Directory.CreateDirectory(RootDirectory);
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(RootDirectory, storedFileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        return $"{UrlPrefix}{storedFileName}";
    }

    public void Delete(string fileUrl)
    {
        var fileName = ExtractFileName(fileUrl);
        if (fileName is null) return;

        var fullPath = Path.Combine(RootDirectory, fileName);
        if (File.Exists(fullPath)) File.Delete(fullPath);
    }

    public Task<(Stream Stream, string ContentType)?> OpenAsync(string storedFileName)
    {
        var safeFileName = Path.GetFileName(storedFileName);
        var fullPath = Path.Combine(RootDirectory, safeFileName);
        if (!File.Exists(fullPath)) return Task.FromResult<(Stream, string)?>(null);

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult<(Stream, string)?>((stream, "application/pdf"));
    }

    private static string? ExtractFileName(string fileUrl) =>
        fileUrl.StartsWith(UrlPrefix, StringComparison.Ordinal) ? fileUrl[UrlPrefix.Length..] : null;
}
