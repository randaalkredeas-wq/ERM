"use client";

import { startTransition, useEffect, useSyncExternalStore } from "react";

import { useIsClient } from "@/hooks/useIsClient";
import { apiClient } from "@/lib/api-client";
import type { NotificationItem } from "@/types";

const EMPTY_NOTIFICATIONS: NotificationItem[] = [];

/** Module-level store — see risk-register-context.tsx for why. */
let notifications: NotificationItem[] = [];
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
  return notifications;
}

async function ensureLoaded() {
  if (loadStatus === "loading" || loadStatus === "ready") return;
  loadStatus = "loading";
  try {
    const res = await apiClient.get<{ data: NotificationItem[] }>(
      "/api/notifications",
    );
    notifications = res.data;
    loadStatus = "ready";
  } catch {
    loadStatus = "error";
  }
  // See risk-register-context.tsx: avoids a hydration-mismatch race when
  // this resolves in the same tick as the initial hydration commit.
  startTransition(() => emit());
}

export function markNotificationRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  emit();
  void apiClient.post(`/api/notifications/${id}/read`).catch(() => {
    // Best-effort - a failed sync just means the badge reappears next load.
  });
}

export function markAllNotificationsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  emit();
  void apiClient.post("/api/notifications/mark-all-read").catch(() => {
    // Best-effort - see markNotificationRead.
  });
}

export function useNotifications() {
  const isClient = useIsClient();
  const notifications = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    void ensureLoaded();
  }, []);

  return isClient ? notifications : EMPTY_NOTIFICATIONS;
}
