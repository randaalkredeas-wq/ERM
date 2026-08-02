import * as XLSX from "xlsx";

function timestampedName(title: string, extension: string) {
  const date = new Date().toISOString().slice(0, 10);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${slug}-${date}.${extension}`;
}

export function exportReportToExcel(title: string, rows: Record<string, string | number>[]) {
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 22 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, title.slice(0, 31));
  XLSX.writeFile(workbook, timestampedName(title, "xlsx"));
}

export async function exportReportToPdf(title: string, rows: Record<string, string | number>[]) {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`, 14, 22);

  const columns = Object.keys(rows[0] ?? {});
  autoTable(doc, {
    startY: 28,
    head: [columns],
    body: rows.map((row) => columns.map((c) => String(row[c] ?? ""))),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [246, 245, 251] },
  });

  doc.save(timestampedName(title, "pdf"));
}
