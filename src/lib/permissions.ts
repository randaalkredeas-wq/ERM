import type { UserRole } from "@/generated/prisma/enums";

export type Module =
  | "dashboard"
  | "riskRegister"
  | "portfolio"
  | "heatMap"
  | "incidents"
  | "kriKpi"
  | "approvals"
  | "auditLog"
  | "documents"
  | "aiInsights"
  | "reports"
  | "users"
  | "settings"
  | "rcsa"
  | "controlsLibrary"
  | "issues"
  | "actionPlans"
  | "vendorRisk"
  | "businessContinuity"
  | "compliance";

export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "export"
  | "manage";

type ModulePermissions = Partial<Record<Module, Action[]>>;

/**
 * Single source of truth for role-based access control. Every API route
 * calls `can()` (or `requirePermission()`) against this matrix before
 * touching data - never trust a hidden button as the only guard.
 *
 * A handful of actions are further scoped by ownership/department; see
 * `canActOnRisk` below, which layers on top of this coarse module matrix.
 */
const PERMISSIONS: Record<UserRole, ModulePermissions> = {
  SYSTEM_ADMIN: {
    dashboard: ["view"],
    riskRegister: ["view", "create", "edit", "delete", "export"],
    portfolio: ["view", "export"],
    heatMap: ["view"],
    incidents: ["view", "create", "edit", "delete"],
    kriKpi: ["view", "create", "edit", "delete"],
    approvals: ["view"],
    auditLog: ["view", "export"],
    documents: ["view", "create", "edit", "delete"],
    aiInsights: ["view"],
    reports: ["view", "create", "export"],
    users: ["view", "create", "edit", "delete", "manage"],
    settings: ["view", "edit", "manage"],
    rcsa: ["view", "create", "edit", "delete", "approve", "export"],
    controlsLibrary: ["view", "create", "edit", "delete", "export"],
    issues: ["view", "create", "edit", "delete", "export"],
    actionPlans: ["view", "create", "edit", "delete", "export"],
    vendorRisk: ["view", "create", "edit", "delete", "export"],
    businessContinuity: ["view", "create", "edit", "delete", "export"],
    compliance: ["view", "create", "edit", "delete", "export"],
  },
  CRO: {
    dashboard: ["view"],
    riskRegister: ["view", "create", "edit", "delete", "approve", "export"],
    portfolio: ["view", "export"],
    heatMap: ["view"],
    incidents: ["view", "create", "edit"],
    kriKpi: ["view", "create", "edit"],
    approvals: ["view", "approve"],
    auditLog: ["view", "export"],
    documents: ["view", "create", "edit", "delete"],
    aiInsights: ["view"],
    reports: ["view", "create", "export"],
    users: ["view"],
    settings: ["view"],
    rcsa: ["view", "create", "edit", "delete", "approve", "export"],
    controlsLibrary: ["view", "create", "edit", "delete", "export"],
    issues: ["view", "create", "edit", "delete", "approve", "export"],
    actionPlans: ["view", "create", "edit", "delete", "export"],
    vendorRisk: ["view", "create", "edit", "delete", "export"],
    businessContinuity: ["view", "create", "edit", "delete", "export"],
    compliance: ["view", "create", "edit", "delete", "export"],
  },
  DEPARTMENT_MANAGER: {
    dashboard: ["view"],
    riskRegister: ["view", "create", "edit", "approve", "export"],
    portfolio: ["view"],
    heatMap: ["view"],
    incidents: ["view", "create", "edit"],
    kriKpi: ["view"],
    approvals: ["view", "approve"],
    auditLog: ["view"],
    documents: ["view", "create", "edit"],
    aiInsights: ["view"],
    reports: ["view", "create", "export"],
    users: [],
    settings: [],
    rcsa: ["view", "create", "edit", "approve", "export"],
    controlsLibrary: ["view", "create", "edit", "export"],
    issues: ["view", "create", "edit", "approve", "export"],
    actionPlans: ["view", "create", "edit", "export"],
    vendorRisk: ["view", "create", "edit", "export"],
    businessContinuity: ["view", "create", "edit", "export"],
    compliance: ["view", "create", "edit", "export"],
  },
  RISK_OWNER: {
    dashboard: ["view"],
    riskRegister: ["view", "create", "edit", "export"],
    portfolio: ["view"],
    heatMap: ["view"],
    incidents: ["view", "create"],
    kriKpi: ["view"],
    approvals: ["view"],
    auditLog: [],
    documents: ["view", "create"],
    aiInsights: ["view"],
    reports: ["view"],
    users: [],
    settings: [],
    rcsa: ["view", "create", "edit"],
    controlsLibrary: ["view"],
    issues: ["view", "create", "edit"],
    actionPlans: ["view", "create", "edit"],
    vendorRisk: ["view"],
    businessContinuity: ["view"],
    compliance: ["view"],
  },
  EMPLOYEE: {
    dashboard: ["view"],
    riskRegister: ["view"],
    portfolio: [],
    heatMap: ["view"],
    incidents: ["view", "create"],
    kriKpi: ["view"],
    approvals: [],
    auditLog: [],
    documents: ["view"],
    aiInsights: ["view"],
    reports: ["view"],
    users: [],
    settings: [],
    rcsa: ["view", "create"],
    controlsLibrary: ["view"],
    issues: ["view", "create"],
    actionPlans: ["view"],
    vendorRisk: ["view"],
    businessContinuity: ["view"],
    compliance: ["view"],
  },
  AUDITOR: {
    dashboard: ["view"],
    riskRegister: ["view", "export"],
    portfolio: ["view", "export"],
    heatMap: ["view"],
    incidents: ["view"],
    kriKpi: ["view"],
    approvals: ["view"],
    auditLog: ["view", "export"],
    documents: ["view"],
    aiInsights: ["view"],
    reports: ["view", "export"],
    users: [],
    settings: [],
    rcsa: ["view", "export"],
    controlsLibrary: ["view", "export"],
    issues: ["view", "export"],
    actionPlans: ["view", "export"],
    vendorRisk: ["view", "export"],
    businessContinuity: ["view", "export"],
    compliance: ["view", "export"],
  },
  READONLY_EXECUTIVE: {
    dashboard: ["view"],
    riskRegister: ["view"],
    portfolio: ["view"],
    heatMap: ["view"],
    incidents: ["view"],
    kriKpi: ["view"],
    approvals: [],
    auditLog: [],
    documents: [],
    aiInsights: ["view"],
    reports: ["view"],
    users: [],
    settings: [],
    rcsa: ["view"],
    controlsLibrary: ["view"],
    issues: ["view"],
    actionPlans: ["view"],
    vendorRisk: ["view"],
    businessContinuity: ["view"],
    compliance: ["view"],
  },
};

export function can(role: UserRole, module: Module, action: Action): boolean {
  return PERMISSIONS[role]?.[module]?.includes(action) ?? false;
}

export class ForbiddenError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws ForbiddenError (catch in the route and map to a 403 response). */
export function requirePermission(
  role: UserRole,
  module: Module,
  action: Action,
): void {
  if (!can(role, module, action)) {
    throw new ForbiddenError(
      `Role ${role} cannot ${action} ${module}.`,
    );
  }
}

interface RiskOwnershipContext {
  ownerId: string;
  createdById: string;
}

/**
 * Ownership-scoped check layered on top of the coarse module matrix: admins,
 * the CRO, and department managers may act on any risk; a risk owner may
 * only act on risks they own or created.
 */
export function canActOnRisk(
  user: { id: string; role: UserRole },
  action: Action,
  risk: RiskOwnershipContext,
): boolean {
  if (!can(user.role, "riskRegister", action)) return false;

  if (
    user.role === "SYSTEM_ADMIN" ||
    user.role === "CRO" ||
    user.role === "DEPARTMENT_MANAGER"
  ) {
    return true;
  }

  if (user.role === "RISK_OWNER") {
    return risk.ownerId === user.id || risk.createdById === user.id;
  }

  return false;
}

/** Only the CRO and department managers decide workflow transitions. */
export function canApproveWorkflow(role: UserRole): boolean {
  return can(role, "riskRegister", "approve");
}
