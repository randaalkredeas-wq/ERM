"use client";

import { useSyncExternalStore } from "react";

import { notifications as seedNotifications } from "@/lib/mock-data/notifications";
import type { NotificationItem } from "@/types";

/** Module-level store — see risk-register-context.tsx for why. */
let notifications: NotificationItem[] = seedNotifications;
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
  return notifications;
}

export function addNotification(
  input: Omit<NotificationItem, "id" | "time" | "read">,
) {
  counter += 1;
  notifications = [
    { id: `NTF-G-${counter}`, time: "Just now", read: false, ...input },
    ...notifications,
  ];
  emit();
}

export function markNotificationRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  emit();
}

export function markAllNotificationsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  emit();
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
