import * as XLSX from "xlsx";

import {
  CATEGORY_SUBCATEGORIES,
  CONTROL_EFFECTIVENESS_OPTIONS,
  DEPARTMENTS,
  RISK_CATEGORIES,
  RISK_OWNERS,
  RISK_SOURCES,
  RISK_TREATMENT_OPTIONS,
  RISK_TYPES,
  REVIEW_FREQUENCY_OPTIONS,
  STRATEGIC_OBJECTIVES,
} from "@/constants/risk-register";
import { riskScore, severityFromScore } from "@/lib/domain";
import type {
  ControlEffectiveness,
  RiskFormInput,
  RiskItem,
  RiskStatus,
  RiskTreatmentStrategy,
  ReviewFrequency,
} from "@/types";

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

function toExportRow(risk: RiskItem) {
  return {
    "Risk ID": risk.id,
    Title: risk.title,
    Description: risk.description,
    Department: risk.department,
    Category: risk.category,
    Subcategory: risk.subcategory,
    "Risk Source": risk.riskSource,
    "Risk Type": risk.riskType,
    "Strategic Objective": risk.strategicObjective,
    "Root Cause": risk.rootCause,
    Consequences: risk.consequences,
    "Existing Controls": risk.existingControls,
    "Control Effectiveness": risk.controlEffectiveness,
    "Inherent Likelihood": risk.inherentLikelihood,
    "Inherent Impact": risk.inherentImpact,
    "Inherent Risk": risk.inherentRisk,
    Likelihood: risk.likelihood,
    Impact: risk.impact,
    "Residual Risk": severityFromScore(riskScore(risk)),
    "Target Likelihood": risk.targetLikelihood,
    "Target Impact": risk.targetImpact,
    "Target Risk": risk.targetRisk,
    "Risk Treatment": risk.riskTreatment,
    "Review Frequency": risk.reviewFrequency,
    "Next Review Date": risk.nextReviewDate,
    Owner: risk.owner,
    "Due Date": risk.dueDate,
    Status: risk.status,
    "Workflow Status": risk.workflowStatus,
    Archived: risk.isArchived ? "Yes" : "No",
    "Last Updated": risk.updatedAt,
  };
}

function timestampedName(extension: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `risk-register-${date}.${extension}`;
}

export function exportRisksToExcel(risks: RiskItem[]) {
  const rows = risks.map(toExportRow);
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Risk Register");
  XLSX.writeFile(workbook, timestampedName("xlsx"));
}

export async function exportRisksToPdf(risks: RiskItem[]) {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Risk Register", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "ID",
        "Title",
        "Department",
        "Category",
        "Owner",
        "Inherent Risk",
        "Residual Risk",
        "Target Risk",
        "Status",
        "Workflow",
        "Due Date",
      ],
    ],
    body: risks.map((risk) => [
      risk.id,
      risk.title,
      risk.department,
      risk.category,
      risk.owner,
      risk.inherentRisk,
      severityFromScore(riskScore(risk)),
      risk.targetRisk,
      risk.status,
      risk.workflowStatus,
      risk.dueDate,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [246, 245, 251] },
  });

  doc.save(timestampedName("pdf"));
}

const VALID_STATUSES: RiskStatus[] = ["open", "mitigating", "closed"];
const VALID_CONTROL_EFFECTIVENESS = [...CONTROL_EFFECTIVENESS_OPTIONS];
const VALID_TREATMENTS = [...RISK_TREATMENT_OPTIONS];
const VALID_REVIEW_FREQUENCIES = [...REVIEW_FREQUENCY_OPTIONS];

function pickFrom<T extends string>(
  value: unknown,
  allowed: T[],
  fallback: T,
): T {
  const str = String(value ?? "").trim();
  const match = allowed.find((a) => a.toLowerCase() === str.toLowerCase());
  return match ?? fallback;
}

function clampLevel(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 3;
  return Math.min(5, Math.max(1, Math.round(num)));
}

function parseDate(value: unknown, fallbackDaysAhead = 0): string {
  const str = String(value ?? "").trim();
  const date = new Date(str);
  if (str && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + fallbackDaysAhead);
  return fallback.toISOString().slice(0, 10);
}

export class RiskImportError extends Error {}

export async function parseRisksFromExcel(
  file: File,
): Promise<RiskFormInput[]> {
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    throw new RiskImportError("File is too large (max 5 MB).");
  }

  let rows: Record<string, unknown>[];
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error("empty workbook");
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  } catch {
    throw new RiskImportError(
      "Could not read that file. Please upload a valid Excel export.",
    );
  }

  if (rows.length === 0) {
    throw new RiskImportError("No rows found in that file.");
  }

  return rows.map((row): RiskFormInput => {
    const category = pickFrom(
      row["Category"],
      [...RISK_CATEGORIES],
      RISK_CATEGORIES[0],
    );
    const subcategoryOptions = CATEGORY_SUBCATEGORIES[category] ?? [];
    const subcategory = pickFrom(
      row["Subcategory"],
      subcategoryOptions,
      subcategoryOptions[0] ?? "",
    );
    const inherentLikelihood = clampLevel(row["Inherent Likelihood"]);
    const inherentImpact = clampLevel(row["Inherent Impact"]);

    return {
      title: String(row["Title"] ?? "Untitled risk").slice(0, 200),
      description: String(row["Description"] ?? ""),
      department: pickFrom(row["Department"], [...DEPARTMENTS], DEPARTMENTS[0]),
      category,
      subcategory,
      riskSource: pickFrom(
        row["Risk Source"],
        [...RISK_SOURCES],
        RISK_SOURCES[0],
      ),
      riskType: pickFrom(row["Risk Type"], [...RISK_TYPES], RISK_TYPES[0]),
      strategicObjective: pickFrom(
        row["Strategic Objective"],
        [...STRATEGIC_OBJECTIVES],
        STRATEGIC_OBJECTIVES[0],
      ),
      rootCause: String(row["Root Cause"] ?? ""),
      consequences: String(row["Consequences"] ?? ""),
      existingControls: String(row["Existing Controls"] ?? ""),
      controlEffectiveness: pickFrom(
        row["Control Effectiveness"],
        VALID_CONTROL_EFFECTIVENESS,
        "partially-effective" as ControlEffectiveness,
      ),
      inherentLikelihood,
      inherentImpact,
      likelihood: clampLevel(row["Likelihood"] ?? inherentLikelihood),
      impact: clampLevel(row["Impact"] ?? inherentImpact),
      targetLikelihood: clampLevel(row["Target Likelihood"] ?? 2),
      targetImpact: clampLevel(row["Target Impact"] ?? 2),
      riskTreatment: pickFrom(
        row["Risk Treatment"],
        VALID_TREATMENTS,
        "mitigate" as RiskTreatmentStrategy,
      ),
      reviewFrequency: pickFrom(
        row["Review Frequency"],
        VALID_REVIEW_FREQUENCIES,
        "quarterly" as ReviewFrequency,
      ),
      nextReviewDate: parseDate(row["Next Review Date"], 90),
      owner: pickFrom(row["Owner"], [...RISK_OWNERS], RISK_OWNERS[0]),
      status: pickFrom(row["Status"], VALID_STATUSES, "open"),
      dueDate: parseDate(row["Due Date"], 30),
    };
  });
}
