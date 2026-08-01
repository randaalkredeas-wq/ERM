import "server-only";

import type { User } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { UserItem } from "@/types";

const ROLE_LABELS: Record<User["role"], string> = {
  SYSTEM_ADMIN: "System Administrator",
  CRO: "Chief Risk Officer",
  DEPARTMENT_MANAGER: "Department Manager",
  RISK_OWNER: "Risk Owner",
  EMPLOYEE: "Employee",
  AUDITOR: "Auditor",
  READONLY_EXECUTIVE: "Read-only Executive",
};

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
      : "Never",
  };
}
