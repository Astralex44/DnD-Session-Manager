// Where the actual code (not just an "unlocked" flag) lives once a player
// enters it correctly — sessionStorage so it doesn't survive closing the
// tab, but does survive normal navigation within the session. Kept as a
// small shared helper (not component state) because api/characters.ts and
// api/notes.ts both need to read it to attach the X-Access-Code header on
// every request for that resource, without threading it through props.
const PREFIX = 'dnd-access-code';

function storageKey(resourceType: string, resourceKey: string): string {
  return `${PREFIX}:${resourceType}:${resourceKey}`;
}

export function getStoredCode(resourceType: string, resourceKey: string): string | null {
  try {
    return sessionStorage.getItem(storageKey(resourceType, resourceKey));
  } catch {
    return null;
  }
}

export function setStoredCode(resourceType: string, resourceKey: string, code: string): void {
  try {
    sessionStorage.setItem(storageKey(resourceType, resourceKey), code);
  } catch {
    // Private-browsing/storage-blocked — the gate will just re-prompt next
    // time, same as a normal wrong-code retry. Not worth surfacing an error.
  }
}

// Header object to spread into an apiClient call for a lock-protected
// resource — empty when no code is stored, which is exactly right for an
// unlocked resource (the backend only checks the header when a lock exists).
export function accessCodeHeaders(resourceType: string, resourceKey: string): HeadersInit {
  const code = getStoredCode(resourceType, resourceKey);
  return code ? { 'X-Access-Code': code } : {};
}

