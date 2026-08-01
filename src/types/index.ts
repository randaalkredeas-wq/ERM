export interface NavItem {
  label: string;
  href: string;
}

export type Severity = "low" | "medium" | "high" | "critical";

export type RiskStatus = "open" | "mitigating" | "closed";

export interface RiskItem {
  id: string;
  title: string;
  category: string;
  owner: string;
  likelihood: number;
  impact: number;
  status: RiskStatus;
  updatedAt: string;
}

export type IncidentStatus = "open" | "in-progress" | "resolved";

export interface IncidentItem {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  reportedBy: string;
  reportedAt: string;
  status: IncidentStatus;
}

export type KriStatus = "on-track" | "at-risk" | "breached";

export interface KriItem {
  id: string;
  name: string;
  category: string;
  current: number;
  target: number;
  unit: string;
  trend: number[];
  status: KriStatus;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
export type ApprovalPriority = "low" | "medium" | "high";

export interface ApprovalItem {
  id: string;
  title: string;
  type: string;
  requestedBy: string;
  submittedAt: string;
  dueDate: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ip: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: string;
  owner: string;
  version: string;
  updatedAt: string;
  size: string;
  fileType: "pdf" | "doc" | "xls" | "ppt";
}

export type UserStatus = "active" | "inactive" | "invited";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: UserStatus;
  lastLogin: string;
}

export interface ReportTemplateItem {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface GeneratedReportItem {
  id: string;
  name: string;
  type: string;
  generatedBy: string;
  date: string;
  format: "PDF" | "XLSX" | "PPTX";
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  tone: "primary" | "success" | "warning" | "danger" | "info";
}

export interface AiInsightItem {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: string;
  severity: Severity;
  generatedAt: string;
}
