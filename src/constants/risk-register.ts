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
