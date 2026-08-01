import * as XLSX from "xlsx";

import {
  CATEGORY_SUBCATEGORIES,
  DEPARTMENTS,
  RISK_CATEGORIES,
  RISK_OWNERS,
} from "@/constants/risk-register";
import { riskScore, severityFromScore } from "@/lib/domain";
import type { RiskFormInput, RiskItem, RiskStatus, Severity } from "@/types";

const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

function toExportRow(risk: RiskItem) {
  return {
    "Risk ID": risk.id,
    Title: risk.title,
    Department: risk.department,
    Category: risk.category,
    Subcategory: risk.subcategory,
    "Root Cause": risk.rootCause,
    "Existing Controls": risk.existingControls,
    "Inherent Risk": risk.inherentRisk,
    Likelihood: risk.likelihood,
    Impact: risk.impact,
    "Residual Risk": severityFromScore(riskScore(risk)),
    Owner: risk.owner,
    "Due Date": risk.dueDate,
    Status: risk.status,
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
  sheet["!cols"] = [
    { wch: 10 },
    { wch: 42 },
    { wch: 18 },
    { wch: 14 },
    { wch: 22 },
    { wch: 34 },
    { wch: 34 },
    { wch: 12 },
    { wch: 10 },
    { wch: 8 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 16 },
    { wch: 14 },
  ];
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
        "Status",
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
      risk.status,
      risk.dueDate,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [246, 245, 251] },
  });

  doc.save(timestampedName("pdf"));
}

const VALID_STATUSES: RiskStatus[] = ["open", "mitigating", "closed"];
const VALID_SEVERITIES: Severity[] = ["low", "medium", "high", "critical"];

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

function parseDate(value: unknown): string {
  const str = String(value ?? "").trim();
  const date = new Date(str);
  if (str && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
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

    return {
      title: String(row["Title"] ?? "Untitled risk").slice(0, 200),
      department: pickFrom(row["Department"], [...DEPARTMENTS], DEPARTMENTS[0]),
      category,
      subcategory,
      rootCause: String(row["Root Cause"] ?? ""),
      existingControls: String(row["Existing Controls"] ?? ""),
      inherentRisk: pickFrom(row["Inherent Risk"], VALID_SEVERITIES, "medium"),
      owner: pickFrom(row["Owner"], [...RISK_OWNERS], RISK_OWNERS[0]),
      likelihood: clampLevel(row["Likelihood"]),
      impact: clampLevel(row["Impact"]),
      status: pickFrom(row["Status"], VALID_STATUSES, "open"),
      dueDate: parseDate(row["Due Date"]),
    };
  });
}
