export const BUSINESS_UNITS = [
  "Retail Banking",
  "Corporate Banking",
  "Treasury",
  "Technology & Digital",
  "Operations",
  "Risk & Compliance",
  "Human Resources",
  "Finance",
] as const;

export const RCSA_PROCESSES: Record<string, string[]> = {
  "Retail Banking": ["Account Opening", "Card Issuance", "Branch Cash Handling"],
  "Corporate Banking": ["Loan Origination", "Trade Finance", "Credit Renewal"],
  Treasury: ["Liquidity Management", "FX Trading", "Investment Portfolio"],
  "Technology & Digital": ["Change Management", "Access Provisioning", "Incident Response"],
  Operations: ["Payment Processing", "Reconciliation", "Vendor Onboarding"],
  "Risk & Compliance": ["Regulatory Reporting", "AML Monitoring", "Policy Review"],
  "Human Resources": ["Recruitment", "Payroll Processing", "Performance Management"],
  Finance: ["Financial Close", "Budgeting", "Procurement"],
};

export const CONTROL_TYPE_OPTIONS = [
  "preventive",
  "detective",
  "corrective",
] as const;

export const CONTROL_FREQUENCY_OPTIONS = [
  "continuous",
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "annual",
] as const;

export const INCIDENT_CATEGORIES = [
  "Cybersecurity",
  "Operational",
  "Compliance",
  "Health & Safety",
  "Technology",
  "Fraud",
] as const;

export const INCIDENT_IMPACT_LEVELS = ["low", "medium", "high", "severe"] as const;

export const REGULATIONS = [
  "SAMA Cyber Security Framework",
  "SAMA BCM Framework",
  "GDPR",
  "Basel III",
  "PCI DSS",
  "AML/CFT Law",
  "PDPL",
] as const;

export const ISSUE_SOURCE_OPTIONS = [
  "audit",
  "rcsa",
  "incident",
  "regulatory",
  "self-identified",
  "management-review",
] as const;

export const VENDOR_CATEGORIES = [
  "Cloud & Infrastructure",
  "Core Banking Software",
  "Payment Processing",
  "Professional Services",
  "Facilities & Security",
  "Marketing & Media",
] as const;

export const VENDOR_CLASSIFICATION_OPTIONS = [
  "critical",
  "high",
  "medium",
  "low",
] as const;

export const BCP_TEST_TYPES = [
  "Tabletop Exercise",
  "Walkthrough",
  "Full Simulation",
  "Call Tree Test",
] as const;

export const COMPLIANCE_JURISDICTIONS = [
  "SAMA",
  "CMA",
  "GDPR",
  "PDPL",
  "Internal Policy",
  "Basel Committee",
] as const;
