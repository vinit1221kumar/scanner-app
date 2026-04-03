export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export function getSessionIdFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get('sessionId')?.trim() || '';
}
