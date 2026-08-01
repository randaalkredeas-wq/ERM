"use client";

import { startTransition, useEffect, useSyncExternalStore } from "react";

import { useIsClient } from "@/hooks/useIsClient";
import { apiClient } from "@/lib/api-client";
import type { AuditLogEntry } from "@/types";

const EMPTY_ENTRIES: AuditLogEntry[] = [];

/**
 * Module-level store (not React state) so audit entries survive route
 * transitions the same way the risk register store does — see the note in
 * risk-register-context.tsx for why this pattern is required here.
 *
 * Backed by the real `/api/audit-log` endpoint; entries are immutable once
 * written (the server is the only writer), so this store only ever reads.
 */
let entries: AuditLogEntry[] = [];
let loadStatus: "idle" | "loading" | "ready" | "error" = "idle";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return entries;
}

async function ensureLoaded() {
  if (loadStatus === "loading" || loadStatus === "ready") return;
  loadStatus = "loading";
  try {
    const res = await apiClient.get<{ data: AuditLogEntry[] }>(
      "/api/audit-log?pageSize=200",
    );
    entries = res.data;
    loadStatus = "ready";
  } catch {
    loadStatus = "error";
  }
  // See risk-register-context.tsx: avoids a hydration-mismatch race when
  // this resolves in the same tick as the initial hydration commit.
  startTransition(() => emit());
}

export function useAuditLog() {
  const isClient = useIsClient();
  const entries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void ensureLoaded();
  }, []);

  return isClient ? entries : EMPTY_ENTRIES;
}
