"use client";

import { useSyncExternalStore } from "react";

import { auditLog as seedAuditLog } from "@/lib/mock-data/audit-log";
import type { AuditLogEntry } from "@/types";

/**
 * Module-level store (not React state) so audit entries survive route
 * transitions the same way the risk register store does — see the note in
 * risk-register-context.tsx for why this pattern is required here.
 */
let entries: AuditLogEntry[] = seedAuditLog;
let counter = 0;
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

export function addAuditEntry(entry: Omit<AuditLogEntry, "id" | "ip">) {
  counter += 1;
  entries = [
    { id: `AUD-G-${counter}`, ip: "10.42.3.77", ...entry },
    ...entries,
  ];
  emit();
}

export function useAuditLog() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
