export interface NavItem {
  label: string;
  href: string;
}

export type Severity = "low" | "medium" | "high" | "critical";

export type RiskStatus = "open" | "mitigating" | "closed";

export type AttachmentType = "pdf" | "doc" | "xls" | "ppt" | "image" | "other";

export interface RiskAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  /** Present only for files uploaded client-side during this session. */
  objectUrl?: string;
}

export interface RiskComment {
  id: string;
  author: string;
  authorInitials: string;
  message: string;
  createdAt: string;
}

export interface RiskAuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export type ControlEffectiveness =
  | "ineffective"
  | "partially-effective"
  | "effective"
  | "highly-effective";

export type RiskTreatmentStrategy = "accept" | "mitigate" | "transfer" | "avoid";

export type ReviewFrequency = "monthly" | "quarterly" | "semi-annual" | "annual";

export type RiskAppetiteStatus =
  | "within-appetite"
  | "near-limit"
  | "exceeds-appetite";

export type RiskWorkflowStatus =
  | "draft"
  | "under-review"
  | "approved"
  | "rejected"
  | "closed";

export interface WorkflowTransition {
  id: string;
  fromStatus: RiskWorkflowStatus;
  toStatus: RiskWorkflowStatus;
  actor: string;
  comment?: string;
  timestamp: string;
}

export type TreatmentActionStatus = "not-started" | "in-progress" | "completed";

export interface TreatmentAction {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  status: TreatmentActionStatus;
  progress: number;
}

export interface RiskVersion {
  id: string;
  version: number;
  editedBy: string;
  editedAt: string;
  summary: string;
  snapshot: {
    title: string;
    status: RiskStatus;
    workflowStatus: RiskWorkflowStatus;
    likelihood: number;
    impact: number;
    inherentRisk: Severity;
    targetRisk: Severity;
  };
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  department: string;
  category: string;
  subcategory: string;
  riskSource: string;
  riskType: string;
  strategicObjective: string;
  rootCause: string;
  consequences: string;
  existingControls: string;
  controlEffectiveness: ControlEffectiveness;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRisk: Severity;
  likelihood: number;
  impact: number;
  targetLikelihood: number;
  targetImpact: number;
  targetRisk: Severity;
  riskTreatment: RiskTreatmentStrategy;
  reviewFrequency: ReviewFrequency;
  nextReviewDate: string;
  owner: string;
  status: RiskStatus;
  workflowStatus: RiskWorkflowStatus;
  workflowHistory: WorkflowTransition[];
  dueDate: string;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  attachments: RiskAttachment[];
  comments: RiskComment[];
  treatmentPlans: TreatmentAction[];
  auditTrail: RiskAuditEntry[];
  versions: RiskVersion[];
}

export interface RiskFormInput {
  title: string;
  description: string;
  department: string;
  category: string;
  subcategory: string;
  riskSource: string;
  riskType: string;
  strategicObjective: string;
  rootCause: string;
  consequences: string;
  existingControls: string;
  controlEffectiveness: ControlEffectiveness;
  inherentLikelihood: number;
  inherentImpact: number;
  likelihood: number;
  impact: number;
  targetLikelihood: number;
  targetImpact: number;
  riskTreatment: RiskTreatmentStrategy;
  reviewFrequency: ReviewFrequency;
  nextReviewDate: string;
  owner: string;
  status: RiskStatus;
  dueDate: string;
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
