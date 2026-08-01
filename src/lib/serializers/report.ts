import "server-only";

import type { Prisma, ReportTemplate } from "@/generated/prisma/client";
import type { GeneratedReportItem, ReportTemplateItem } from "@/types";

export function serializeReportTemplate(template: ReportTemplate): ReportTemplateItem {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
  };
}

export type GeneratedReportWithAuthor = Prisma.GeneratedReportGetPayload<{
  include: { generatedBy: true };
}>;

export function serializeGeneratedReport(
  report: GeneratedReportWithAuthor,
): GeneratedReportItem {
  return {
    id: report.id,
    name: report.name,
    type: report.type,
    generatedBy: report.generatedBy.name,
    date: report.createdAt.toISOString().slice(0, 10),
    format: report.format,
  };
}
