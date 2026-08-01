import type { UserRole } from "@/generated/prisma/enums";

export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: "System Administrator",
  CRO: "Chief Risk Officer",
  DEPARTMENT_MANAGER: "Department Manager",
  RISK_OWNER: "Risk Owner",
  EMPLOYEE: "Employee",
  AUDITOR: "Auditor",
  READONLY_EXECUTIVE: "Read-only Executive",
};
