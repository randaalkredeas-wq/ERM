import type { AiInsightItem, NotificationItem } from "@/types";

export const notifications: NotificationItem[] = [
  {
    id: "NTF-1",
    title: "Critical KRI breach detected",
    description: "Unplanned system downtime exceeded the 2 hrs/mo threshold.",
    time: "5m ago",
    read: false,
    tone: "danger",
  },
  {
    id: "NTF-2",
    title: "Approval awaiting your review",
    description: "APR-501 risk acceptance requires sign-off by Aug 4.",
    time: "1h ago",
    read: false,
    tone: "warning",
  },
  {
    id: "NTF-3",
    title: "New incident reported",
    description: "INC-3021 logged with Critical severity in Cybersecurity.",
    time: "3h ago",
    read: false,
    tone: "danger",
  },
  {
    id: "NTF-4",
    title: "Report generated successfully",
    description: "Executive Risk Summary — Q2 2026 is ready to download.",
    time: "Yesterday",
    read: true,
    tone: "success",
  },
  {
    id: "NTF-5",
    title: "AI insight available",
    description: "New anomaly detected in vendor risk concentration.",
    time: "2 days ago",
    read: true,
    tone: "info",
  },
];

export const aiInsights: AiInsightItem[] = [
  {
    id: "AI-01",
    title: "Vendor concentration anomaly detected",
    description:
      "Three critical suppliers now represent 42% of total procurement spend, a 9-point increase over the last quarter. This elevates single-point-of-failure exposure in the supply chain risk category.",
    confidence: 92,
    category: "Operational",
    severity: "high",
    generatedAt: "2026-07-31",
  },
  {
    id: "AI-02",
    title: "Predicted breach risk for KRI-08",
    description:
      "Based on the last 6 months of trend data, unplanned system downtime is projected to exceed 4.5 hrs/month within 45 days unless remediation capacity is increased.",
    confidence: 87,
    category: "Technology",
    severity: "critical",
    generatedAt: "2026-07-30",
  },
  {
    id: "AI-03",
    title: "Emerging regulatory theme identified",
    description:
      "Cross-referencing recent regulatory bulletins with your control library suggests 4 controls in APAC data residency may need review before year-end.",
    confidence: 78,
    category: "Compliance",
    severity: "medium",
    generatedAt: "2026-07-29",
  },
  {
    id: "AI-04",
    title: "Correlated incident pattern in cybersecurity",
    description:
      "Phishing-related incidents cluster around end-of-month financial close periods, suggesting targeted social engineering campaigns against the finance team.",
    confidence: 84,
    category: "Cybersecurity",
    severity: "high",
    generatedAt: "2026-07-27",
  },
  {
    id: "AI-05",
    title: "Recommendation: automate control testing",
    description:
      "18% of manual control tests were completed late in the last quarter. Automating evidence collection for the top 10 recurring controls could reduce this to under 5%.",
    confidence: 81,
    category: "Governance",
    severity: "low",
    generatedAt: "2026-07-24",
  },
];
