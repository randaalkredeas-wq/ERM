export const DEPARTMENTS = [
  "Risk & Compliance",
  "Internal Audit",
  "Finance",
  "Technology",
  "Operations",
  "Strategy",
  "Human Resources",
  "Legal",
] as const;

export const RISK_CATEGORIES = [
  "Cybersecurity",
  "Compliance",
  "Operational",
  "Financial",
  "Technology",
  "Human Capital",
  "Strategic",
] as const;

export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  Cybersecurity: [
    "Data Breach",
    "Phishing & Social Engineering",
    "Access Control",
    "Malware & Ransomware",
    "Third-Party Access",
  ],
  Compliance: [
    "Regulatory Filing",
    "Data Privacy",
    "Anti-Bribery & Corruption",
    "Licensing",
    "Cross-Border Regulation",
  ],
  Operational: [
    "Business Continuity",
    "Supply Chain",
    "Process Failure",
    "Vendor Management",
    "Health & Safety",
  ],
  Financial: [
    "Foreign Exchange",
    "Credit Risk",
    "Liquidity",
    "Insurance Coverage",
    "Fraud",
  ],
  Technology: [
    "Legacy Systems",
    "System Downtime",
    "Shadow IT",
    "Change Management",
    "Cloud Migration",
  ],
  "Human Capital": [
    "Talent Attrition",
    "Succession Planning",
    "Skills Gap",
    "Workforce Engagement",
  ],
  Strategic: [
    "Customer Concentration",
    "Market Disruption",
    "M&A Integration",
    "Reputation",
  ],
};

export const RISK_OWNERS = [
  "Layla Haddad",
  "Marcus Chen",
  "Sara Al-Amin",
  "Daniel Osei",
  "Priya Nair",
  "Omar Farouk",
  "Nadia Ibrahim",
  "Yusuf Karimi",
] as const;

export const CHIEF_RISK_OFFICER = "Layla Haddad";

export const DEPARTMENT_HEADS: Record<string, string> = {
  "Risk & Compliance": "Marcus Chen",
  "Internal Audit": "Sara Al-Amin",
  Finance: "Daniel Osei",
  Technology: "Priya Nair",
  Operations: "Omar Farouk",
  Strategy: "Nadia Ibrahim",
  "Human Resources": "Fatima Zahra",
  Legal: "Ahmed Nasser",
};

export const RISK_SOURCES = [
  "Risk Assessment Workshop",
  "Internal Audit Finding",
  "External Audit Finding",
  "Incident-Derived",
  "Regulatory Change",
  "Management Self-Identification",
  "External Consultant Review",
  "Customer Complaint",
] as const;

export const RISK_TYPES = [
  "Strategic",
  "Operational",
  "Financial",
  "Compliance",
  "Reputational",
  "Technology",
  "Hazard",
] as const;

export const STRATEGIC_OBJECTIVES = [
  "Expand into new markets",
  "Achieve operational excellence",
  "Protect brand reputation",
  "Ensure regulatory compliance",
  "Drive digital transformation",
  "Strengthen financial resilience",
  "Build a resilient supply chain",
] as const;

export const CONTROL_EFFECTIVENESS_OPTIONS = [
  "ineffective",
  "partially-effective",
  "effective",
  "highly-effective",
] as const;

export const RISK_TREATMENT_OPTIONS = [
  "accept",
  "mitigate",
  "transfer",
  "avoid",
] as const;

export const REVIEW_FREQUENCY_OPTIONS = [
  "monthly",
  "quarterly",
  "semi-annual",
  "annual",
] as const;

export const WORKFLOW_STATUSES = [
  "draft",
  "under-review",
  "approved",
  "rejected",
  "closed",
] as const;
