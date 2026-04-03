export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
export const PHONE_APP_URL = process.env.NEXT_PUBLIC_PHONE_APP_URL || 'http://localhost:5173';

export function createSessionId() {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createPhoneScanUrl(sessionId: string) {
  const baseUrl = PHONE_APP_URL.replace(/\/$/, '');
  return `${baseUrl}/?sessionId=${encodeURIComponent(sessionId)}`;
}
