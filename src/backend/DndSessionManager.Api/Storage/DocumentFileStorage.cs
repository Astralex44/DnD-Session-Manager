namespace DndSessionManager.Api.Storage;

// Merges what used to be MapFileStorage + BookFileStorage — Maps needed
// images or PDFs, Books needed PDFs only; a Document can be either type so
// this just allows the union rather than validating per-type.
//
// TODO(auth): the tech-stack spec requires shared files to be "served only
// through an authenticated endpoint that checks sharing rules on every
// request" — the serving endpoint is deliberately open right now because
// there's no auth/session yet (see the rest of the app's DEMO_GAME_ID
// pattern). Once Discord auth + JWT land, gate DocumentsController's file
// action on the caller actually having a DocumentShare for that document
// (Books that are DM-only reference material would need their own rule —
// not every Document is meant to be shared).
public class DocumentFileStorage(IWebHostEnvironment env) : IDocumentFileStorage
{
    private const string UrlPrefix = "/api/files/documents/";
    private static readonly HashSet<string> AllowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];

    private string RootDirectory => Path.Combine(env.ContentRootPath, "uploads", "documents");

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

        var contentType = Path.GetExtension(fullPath).ToLowerInvariant() switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            _ => "application/octet-stream",
        };

        Stream stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
        return Task.FromResult<(Stream, string)?>((stream, contentType));
    }

    private static string? ExtractFileName(string fileUrl) =>
        fileUrl.StartsWith(UrlPrefix, StringComparison.Ordinal) ? fileUrl[UrlPrefix.Length..] : null;
}
