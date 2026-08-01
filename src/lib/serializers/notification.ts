import "server-only";

import type { Notification } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { NotificationItem } from "@/types";

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function serializeNotification(notification: Notification): NotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    description: notification.description,
    time: formatRelativeTime(notification.createdAt),
    read: notification.read,
    tone: toKebab(notification.tone),
  };
}
