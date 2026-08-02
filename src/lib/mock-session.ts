/**
 * Client-side-only mock session persistence. Stores the signed-in demo
 * account id + expiry in localStorage, plus a lightweight presence-only
 * cookie so the existing edge proxy (src/proxy.ts) can keep gating routes
 * without any server-side session lookup.
 */

const SESSION_KEY = "erm_mock_session";
const SESSION_COOKIE = "erm_session";

const STANDARD_SESSION_MS = 12 * 60 * 60 * 1000; // 12 hours
const REMEMBER_ME_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface MockSessionRecord {
  userId: string;
  expiresAt: number;
  rememberMe: boolean;
}

function isBrowser() {
  return typeof window !== "undefined";
}

export function createMockSession(
  userId: string,
  rememberMe: boolean,
): MockSessionRecord {
  const durationMs = rememberMe ? REMEMBER_ME_SESSION_MS : STANDARD_SESSION_MS;
  const record: MockSessionRecord = {
    userId,
    expiresAt: Date.now() + durationMs,
    rememberMe,
  };

  if (isBrowser()) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(record));
    const maxAgeSeconds = Math.floor(durationMs / 1000);
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
  }

  return record;
}

export function readMockSession(): MockSessionRecord | null {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const record = JSON.parse(raw) as Partial<MockSessionRecord>;
    if (!record.userId || typeof record.expiresAt !== "number") return null;
    return {
      userId: record.userId,
      expiresAt: record.expiresAt,
      rememberMe: Boolean(record.rememberMe),
    };
  } catch {
    return null;
  }
}

export function isMockSessionExpired(record: MockSessionRecord) {
  return Date.now() >= record.expiresAt;
}

export function clearMockSession() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(SESSION_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
