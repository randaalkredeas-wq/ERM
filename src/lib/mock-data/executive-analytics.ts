import type { EmergingRisk, RiskAppetiteBand, RiskForecastPoint } from "@/types";

export const riskAppetiteBands: RiskAppetiteBand[] = [
  { category: "Credit Risk", appetite: 60, current: 52, status: "within" },
  { category: "Operational Risk", appetite: 55, current: 58, status: "near-limit" },
  { category: "Cybersecurity", appetite: 50, current: 68, status: "breached" },
  { category: "Compliance", appetite: 45, current: 40, status: "within" },
  { category: "Strategic", appetite: 65, current: 62, status: "near-limit" },
  { category: "Financial", appetite: 55, current: 46, status: "within" },
];

export const emergingRisks: EmergingRisk[] = [
  {
    id: "EMR-1",
    title: "Third-party vendor data breach exposure",
    category: "Cybersecurity",
    trend: "increasing",
    severity: "critical",
    velocity: 18,
  },
  {
    id: "EMR-2",
    title: "Regulatory non-compliance in APAC markets",
    category: "Compliance",
    trend: "increasing",
    severity: "high",
    velocity: 12,
  },
  {
    id: "EMR-3",
    title: "Legacy ERP system end-of-life",
    category: "Technology",
    trend: "increasing",
    severity: "high",
    velocity: 9,
  },
  {
    id: "EMR-4",
    title: "Key supplier concentration risk",
    category: "Operational",
    trend: "stable",
    severity: "high",
    velocity: 3,
  },
  {
    id: "EMR-5",
    title: "Foreign exchange volatility exposure",
    category: "Financial",
    trend: "decreasing",
    severity: "medium",
    velocity: -6,
  },
];

export const riskForecast: RiskForecastPoint[] = [
  { label: "Mar", actual: 62, forecast: 62 },
  { label: "Apr", actual: 65, forecast: 65 },
  { label: "May", actual: 61, forecast: 61 },
  { label: "Jun", actual: 67, forecast: 67 },
  { label: "Jul", actual: 64, forecast: 64 },
  { label: "Aug", actual: null, forecast: 66 },
  { label: "Sep", actual: null, forecast: 69 },
  { label: "Oct", actual: null, forecast: 71 },
];
