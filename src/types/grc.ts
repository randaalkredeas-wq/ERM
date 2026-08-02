import type { AttachmentType, ControlEffectiveness, Severity } from "./index";

// ---------------------------------------------------------------------------
// RCSA (Risk & Control Self Assessment)
// ---------------------------------------------------------------------------

export type RcsaCycleStatus =
  | "planning"
  | "in-progress"
  | "under-review"
  | "approved"
  | "closed";

export type ControlType = "preventive" | "detective" | "corrective";

export type RcsaWorkflowStatus =
  | "draft"
  | "self-assessed"
  | "under-review"
  | "approved"
  | "rejected";

export interface RcsaCycle {
  id: string;
  name: string;
  period: string;
  status: RcsaCycleStatus;
  startDate: string;
  endDate: string;
  businessUnitsCount: number;
  assessmentsCount: number;
  completionRate: number;
}

export interface RcsaControlLink {
  id: string;
  name: string;
  type: ControlType;
  effectiveness: ControlEffectiveness;
}

export interface RcsaRiskLink {
  id: string;
  description: string;
  category: string;
  inherentLikelihood: number;
  inherentImpact: number;
  inherentRisk: Severity;
  residualLikelihood: number;
  residualImpact: number;
  residualRisk: Severity;
  controls: RcsaControlLink[];
  recommendation: string;
}

export interface RcsaReviewEntry {
  id: string;
  reviewer: string;
  date: string;
  comment: string;
  decision: "approved" | "rejected" | "changes-requested";
}

export interface RcsaVersion {
  id: string;
  version: number;
  editedBy: string;
  editedAt: string;
  summary: string;
}

export interface RcsaAssessment {
  id: string;
  cycleId: string;
  businessUnit: string;
  process: string;
  subProcess: string;
  owner: string;
  assessor: string;
  status: RcsaWorkflowStatus;
  risks: RcsaRiskLink[];
  overallInherentRisk: Severity;
  overallResidualRisk: Severity;
  actionRecommendations: string[];
  submittedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  reviewHistory: RcsaReviewEntry[];
  versions: RcsaVersion[];
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Controls Library
// ---------------------------------------------------------------------------

export type ControlFrequency =
  | "continuous"
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

export type ControlTestingStatus = "not-tested" | "in-progress" | "passed" | "failed";

export interface ControlItem {
  id: string;
  name: string;
  description: string;
  type: ControlType;
  frequency: ControlFrequency;
  owner: string;
  linkedRisks: string[];
  linkedRegulations: string[];
  testingStatus: ControlTestingStatus;
  effectiveness: ControlEffectiveness;
  lastReview: string;
  nextReview: string;
}

// ---------------------------------------------------------------------------
// Incident Management (enriched)
// ---------------------------------------------------------------------------

export type IncidentSeverityImpact = "low" | "medium" | "high" | "severe";
export type IncidentRecordStatus = "open" | "investigating" | "resolved" | "closed";

export interface IncidentTimelineEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface IncidentAttachment {
  id: string;
  name: string;
  type: AttachmentType;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface IncidentRecord {
  id: string;
  title: string;
  category: string;
  department: string;
  severity: Severity;
  status: IncidentRecordStatus;
  reportedBy: string;
  reportedAt: string;
  rootCause: string;
  impactDescription: string;
  impactLevel: IncidentSeverityImpact;
  financialLoss: number;
  regulatoryImpact: boolean;
  regulatoryImpactNotes: string;
  assignedOwner: string;
  investigationSummary: string;
  correctiveActions: string[];
  preventiveActions: string[];
  attachments: IncidentAttachment[];
  timeline: IncidentTimelineEntry[];
  closureApproved: boolean;
  closureApprovedBy: string | null;
  closureApprovedAt: string | null;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Issue Management
// ---------------------------------------------------------------------------

export type IssueSource =
  | "audit"
  | "rcsa"
  | "incident"
  | "regulatory"
  | "self-identified"
  | "management-review";

export type IssuePriority = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in-progress" | "escalated" | "resolved" | "closed";

export interface IssueComment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
}

export interface IssueItem {
  id: string;
  title: string;
  description: string;
  source: IssueSource;
  relatedRiskId: string | null;
  relatedIncidentId: string | null;
  priority: IssuePriority;
  status: IssueStatus;
  owner: string;
  dueDate: string;
  escalated: boolean;
  escalatedTo: string | null;
  escalatedAt: string | null;
  comments: IssueComment[];
  closureEvidence: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Action Plans (enterprise-wide aggregation)
// ---------------------------------------------------------------------------

export type ActionSourceModule =
  | "risk-register"
  | "rcsa"
  | "incident"
  | "issue"
  | "vendor"
  | "bcm"
  | "compliance";

export type ActionPlanStatus = "not-started" | "in-progress" | "completed";

export interface ActionDependency {
  actionId: string;
  title: string;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  sourceModule: ActionSourceModule;
  sourceRef: string;
  owner: string;
  dueDate: string;
  status: ActionPlanStatus;
  progress: number;
  dependencies: ActionDependency[];
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Vendor & Third-Party Risk
// ---------------------------------------------------------------------------

export type VendorClassification = "critical" | "high" | "medium" | "low";
export type VendorAssessmentStatus = "scheduled" | "in-progress" | "completed" | "overdue";

export interface VendorAssessment {
  id: string;
  date: string;
  type: string;
  status: VendorAssessmentStatus;
  score: number;
  assessor: string;
}

export interface VendorIncidentRef {
  id: string;
  date: string;
  title: string;
  severity: Severity;
}

export interface VendorDocument {
  id: string;
  name: string;
  type: AttachmentType;
  uploadedAt: string;
  expiresAt: string | null;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  classification: VendorClassification;
  riskRating: Severity;
  owner: string;
  contractStart: string;
  contractExpiry: string;
  slaCompliance: number;
  lastDueDiligence: string;
  nextDueDiligence: string;
  assessments: VendorAssessment[];
  incidents: VendorIncidentRef[];
  documents: VendorDocument[];
}

// ---------------------------------------------------------------------------
// Business Continuity Management
// ---------------------------------------------------------------------------

export type BcmCriticality = "critical" | "high" | "medium" | "low";
export type BcpTestResult = "passed" | "passed-with-observations" | "failed" | "not-tested";
export type CrisisEventStatus = "active" | "contained" | "resolved";

export interface BcpTest {
  id: string;
  date: string;
  type: string;
  result: BcpTestResult;
  notes: string;
}

export interface BusinessProcess {
  id: string;
  name: string;
  department: string;
  criticality: BcmCriticality;
  mtd: string;
  rto: string;
  rpo: string;
  recoveryStrategy: string;
  owner: string;
  lastTested: string;
  testResult: BcpTestResult;
  tests: BcpTest[];
}

export interface CrisisEvent {
  id: string;
  title: string;
  description: string;
  status: CrisisEventStatus;
  triggeredAt: string;
  resolvedAt: string | null;
  affectedProcesses: string[];
  responseTeam: string[];
}

// ---------------------------------------------------------------------------
// Compliance Obligations
// ---------------------------------------------------------------------------

export type ComplianceStatus =
  | "compliant"
  | "partially-compliant"
  | "non-compliant"
  | "not-assessed";

export type ObligationType = "regulation" | "policy" | "procedure";

export interface ComplianceObligation {
  id: string;
  title: string;
  type: ObligationType;
  jurisdiction: string;
  owner: string;
  status: ComplianceStatus;
  mappedRisks: string[];
  mappedControls: string[];
  lastReview: string;
  nextReview: string;
}

export interface NonComplianceEntry {
  id: string;
  obligationId: string;
  title: string;
  description: string;
  severity: Severity;
  identifiedDate: string;
  targetResolutionDate: string;
  status: "open" | "remediating" | "resolved";
  owner: string;
}

export interface ComplianceCalendarEntry {
  id: string;
  title: string;
  date: string;
  type: "review" | "filing" | "audit" | "renewal";
}

// ---------------------------------------------------------------------------
// Executive Analytics
// ---------------------------------------------------------------------------

export interface RiskAppetiteBand {
  category: string;
  appetite: number;
  current: number;
  status: "within" | "near-limit" | "breached";
}

export interface EmergingRisk {
  id: string;
  title: string;
  category: string;
  trend: "increasing" | "stable" | "decreasing";
  severity: Severity;
  velocity: number;
}

export interface RiskForecastPoint {
  label: string;
  actual: number | null;
  forecast: number;
}

// ---------------------------------------------------------------------------
// Reports Center
// ---------------------------------------------------------------------------

export type ReportCategory =
  | "board"
  | "executive"
  | "department"
  | "operational-risk"
  | "credit-risk"
  | "compliance"
  | "incident"
  | "vendor-risk"
  | "kri";
