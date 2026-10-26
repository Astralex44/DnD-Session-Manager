namespace DndSessionManager.Api.Storage;

// Maps, books and monster stat blocks can be big (scanned rulebooks, high-res
// battle maps), so their upload endpoints lift Kestrel's ~28.6 MB default.
// Mirrored in the frontend's lib/upload.ts MAX_UPLOAD_BYTES.
public static class UploadLimits
{
    public const long MaxFileBytes = 100L * 1024 * 1024;

    // Headroom for the multipart framing and the other form fields.
    public const long MaxRequestBytes = MaxFileBytes + 1024 * 1024;
}
