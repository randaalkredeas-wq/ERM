import * as XLSX from "xlsx";

import type { CreditExposure } from "@/types";

function timestampedName(extension: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `credit-portfolio-${date}.${extension}`;
}

function toExportRow(exposure: CreditExposure) {
  return {
    "Account ID": exposure.id,
    Customer: exposure.customerName,
    Segment: exposure.segment,
    Sector: exposure.sector,
    Product: exposure.product,
    Exposure: exposure.exposureAmount,
    Outstanding: exposure.outstandingBalance,
    "Days Past Due": exposure.daysPastDue,
    "ECL Stage": exposure.eclStage,
    "ECL Amount": exposure.eclAmount,
    Rating: exposure.riskRating,
    "Collection Status": exposure.collectionStatus,
    Collector: exposure.collector,
    "Last Payment": exposure.lastPaymentDate,
    "Next Action": exposure.nextActionDate,
  };
}

export function exportPortfolioToExcel(exposures: CreditExposure[]) {
  const rows = exposures.map(toExportRow);
  const sheet = XLSX.utils.json_to_sheet(rows);
  sheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Credit Portfolio");
  XLSX.writeFile(workbook, timestampedName("xlsx"));
}

export async function exportPortfolioToPdf(exposures: CreditExposure[]) {
  const [{ default: jsPDF }, autoTable] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable").then((m) => m.default),
  ]);

  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text("Credit Portfolio & Collections", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [
      [
        "Account ID",
        "Customer",
        "Segment",
        "Sector",
        "Product",
        "Outstanding",
        "DPD",
        "ECL Stage",
        "ECL Amount",
        "Rating",
        "Status",
      ],
    ],
    body: exposures.map((exposure) => [
      exposure.id,
      exposure.customerName,
      exposure.segment,
      exposure.sector,
      exposure.product,
      exposure.outstandingBalance,
      exposure.daysPastDue,
      exposure.eclStage,
      exposure.eclAmount,
      exposure.riskRating,
      exposure.collectionStatus,
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [124, 58, 237] },
    alternateRowStyles: { fillColor: [246, 245, 251] },
  });

  doc.save(timestampedName("pdf"));
}
