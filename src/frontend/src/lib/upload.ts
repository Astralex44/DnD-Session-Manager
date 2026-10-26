import { API_BASE_URL, ApiError } from '../api/client.ts';

// Mirrors the backend's Storage/UploadLimits.cs MaxFileBytes. Checked here
// first, so an oversized map or rulebook fails with a clear message right
// away instead of after a long upload (or as a bare network error, since the
// server cuts the connection once the limit is passed).
export const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

const TOO_LARGE = `File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`;

// Multipart upload for documents and monster stat blocks (no JSON
// Content-Type — the browser sets the multipart boundary itself).
export async function uploadForm<T>(path: string, method: 'POST' | 'PUT', form: FormData): Promise<T> {
  const file = form.get('File');
  if (file instanceof File && file.size > MAX_UPLOAD_BYTES) throw new ApiError(413, TOO_LARGE);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: form,
    credentials: 'include',
  });
  if (!response.ok) {
    if (response.status === 413) throw new ApiError(413, TOO_LARGE);
    const body = await response.text();
    throw new ApiError(response.status, body || response.statusText);
  }
  return response.json() as Promise<T>;
}
