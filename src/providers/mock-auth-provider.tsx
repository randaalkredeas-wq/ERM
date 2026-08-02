"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { getDemoAccountById, verifyDemoCredentials, type MockUser } from "@/lib/mock-auth";
import {
  clearMockSession,
  createMockSession,
  isMockSessionExpired,
  readMockSession,
} from "@/lib/mock-session";

export type MockAuthStatus =
  | "loading"
  | "authenticated"
  | "expired"
  | "unauthenticated";

export type LoginErrorCode = "validation_error" | "invalid_credentials";

export interface LoginResult {
  success: boolean;
  errorCode?: LoginErrorCode;
}

interface AuthSnapshot {
  user: MockUser | null;
  status: MockAuthStatus;
}

const SERVER_SNAPSHOT: AuthSnapshot = { user: null, status: "loading" };
const EXPIRY_CHECK_INTERVAL_MS = 60 * 1000;

let cachedSnapshot: AuthSnapshot | null = null;
let notifyStore: (() => void) | null = null;

function computeSnapshot(): AuthSnapshot {
  const record = readMockSession();
  if (!record) return { user: null, status: "unauthenticated" };

  if (isMockSessionExpired(record)) {
    clearMockSession();
    return { user: null, status: "expired" };
  }

  const account = getDemoAccountById(record.userId);
  if (!account) {
    clearMockSession();
    return { user: null, status: "unauthenticated" };
  }

  return { user: account, status: "authenticated" };
}

function setSnapshot(next: AuthSnapshot) {
  cachedSnapshot = next;
  notifyStore?.();
}

function refreshSnapshot() {
  const next = computeSnapshot();
  const prev = cachedSnapshot;
  if (!prev || prev.status !== next.status || prev.user?.id !== next.user?.id) {
    setSnapshot(next);
  }
}

function getSnapshot(): AuthSnapshot {
  if (!cachedSnapshot) {
    cachedSnapshot = computeSnapshot();
  }
  return cachedSnapshot;
}

function getServerSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void) {
  notifyStore = onStoreChange;
  refreshSnapshot();

  const interval = window.setInterval(refreshSnapshot, EXPIRY_CHECK_INTERVAL_MS);

  function handleStorage(event: StorageEvent) {
    if (event.key !== null && event.key !== "erm_mock_session") return;
    refreshSnapshot();
  }
  window.addEventListener("storage", handleStorage);

  return () => {
    window.clearInterval(interval);
    window.removeEventListener("storage", handleStorage);
    if (notifyStore === onStoreChange) notifyStore = null;
  };
}

function login(
  email: string,
  password: string,
  rememberMe: boolean,
): LoginResult {
  if (!email.trim() || !password.trim()) {
    return { success: false, errorCode: "validation_error" };
  }
  const account = verifyDemoCredentials(email, password);
  if (!account) {
    return { success: false, errorCode: "invalid_credentials" };
  }
  createMockSession(account.id, rememberMe);
  setSnapshot({ user: account, status: "authenticated" });
  return { success: true };
}

function logout() {
  clearMockSession();
  setSnapshot({ user: null, status: "unauthenticated" });
}

interface MockAuthContextValue {
  user: MockUser | null;
  status: MockAuthStatus;
  login: typeof login;
  logout: typeof logout;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: MockAuthContextValue = {
    user: snapshot.user,
    status: snapshot.status,
    login,
    logout,
  };

  return (
    <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
  );
}

export function useMockAuth(): MockAuthContextValue {
  const ctx = useContext(MockAuthContext);
  if (!ctx) {
    throw new Error("useMockAuth must be used within a MockAuthProvider");
  }
  return ctx;
}
