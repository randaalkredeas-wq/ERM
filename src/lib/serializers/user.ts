import "server-only";

import type { User } from "@/generated/prisma/client";
import { ROLE_LABELS } from "@/lib/role-labels";
import { toKebab } from "@/lib/serializers/risk";
import type { UserItem } from "@/types";

export function serializeUser(user: User): UserItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.jobTitle || ROLE_LABELS[user.role],
    department: user.department ?? "—",
    status: toKebab(user.status),
    lastLogin: user.lastLoginAt
      ? `${user.lastLoginAt.toISOString().slice(0, 10)} ${user.lastLoginAt.toISOString().slice(11, 16)}`
      : "—",
  };
}
