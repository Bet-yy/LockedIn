const GUEST_ID_KEY = 'lockedin_guest_id';

function createGuestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getGuestId(): string {
  const existingId = window.localStorage.getItem(GUEST_ID_KEY);
  if (existingId) {
    return existingId;
  }

  const nextId = createGuestId();
  window.localStorage.setItem(GUEST_ID_KEY, nextId);
  return nextId;
}
