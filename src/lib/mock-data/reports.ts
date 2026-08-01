import type { GeneratedReportItem, ReportTemplateItem } from "@/types";

export const reportTemplates: ReportTemplateItem[] = [
  {
    id: "TPL-01",
    name: "Executive Risk Summary",
    description: "Board-ready overview of top risks, trends, and mitigations.",
    category: "Executive",
  },
  {
    id: "TPL-02",
    name: "Regulatory Compliance Report",
    description: "Detailed compliance status across all jurisdictions.",
    category: "Compliance",
  },
  {
    id: "TPL-03",
    name: "Incident Analysis Report",
    description: "Root cause analysis and trends for reported incidents.",
    category: "Operational",
  },
  {
    id: "TPL-04",
    name: "KRI / KPI Scorecard",
    description: "Performance against key risk and performance indicators.",
    category: "Performance",
  },
  {
    id: "TPL-05",
    name: "Third-Party Risk Report",
    description: "Vendor risk exposure and assessment completion status.",
    category: "Operational",
  },
  {
    id: "TPL-06",
    name: "Audit Trail Extract",
    description: "Exportable log of platform activity for a given period.",
    category: "Compliance",
  },
];

export const generatedReports: GeneratedReportItem[] = [
  {
    id: "RPT-441",
    name: "Executive Risk Summary — Q2 2026",
    type: "Executive Risk Summary",
    generatedBy: "Omar Farouk",
    date: "2026-07-29",
    format: "PDF",
  },
  {
    id: "RPT-439",
    name: "Regulatory Compliance Report — EMEA",
    type: "Regulatory Compliance Report",
    generatedBy: "Sara Al-Amin",
    date: "2026-07-24",
    format: "PDF",
  },
  {
    id: "RPT-435",
    name: "KRI / KPI Scorecard — July 2026",
    type: "KRI / KPI Scorecard",
    generatedBy: "Priya Nair",
    date: "2026-07-20",
    format: "XLSX",
  },
  {
    id: "RPT-430",
    name: "Incident Analysis — H1 2026",
    type: "Incident Analysis Report",
    generatedBy: "Layla Haddad",
    date: "2026-07-08",
    format: "PPTX",
  },
  {
    id: "RPT-424",
    name: "Third-Party Risk Report — Vendors A-M",
    type: "Third-Party Risk Report",
    generatedBy: "Marcus Chen",
    date: "2026-06-30",
    format: "PDF",
  },
];
