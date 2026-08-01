import * as XLSX from "xlsx";

import type { AuditLogEntry } from "@/types";

function timestampedName(extension: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `audit-log-${date}.${extension}`;
}

function toExportRow(entry: AuditLogEntry) {
  return {
    Timestamp: entry.timestamp,
    User: entry.user,
    Action: entry.action,
    Module: entry.module,
    Details: entry.details,
    "IP Address": entry.ip,
  };
}

export function exportAuditLogToExcel(entries: AuditLogEntry[]) {
  const rows = entries.map(toExportRow);
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Audit Log");
  XLSX.writeFile(workbook, timestampedName("xlsx"));
}

export async function exportAuditLogToPdf(entries: AuditLogEntry[]) {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Audit Log", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Timestamp", "User", "Action", "Module", "Details", "IP Address"]],
    body: entries.map((entry) => [
      entry.timestamp,
      entry.user,
      entry.action,
      entry.module,
      entry.details,
      entry.ip,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [246, 245, 251] },
  });

  doc.save(timestampedName("pdf"));
}
