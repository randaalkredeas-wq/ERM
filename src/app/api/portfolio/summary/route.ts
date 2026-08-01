import { NextResponse } from "next/server";

import { handleApiError, requireApiUser } from "@/lib/api-utils";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { toKebab } from "@/lib/serializers/risk";
import type { AgingBucket, EclStage } from "@/types";

const AGING_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: "Current", min: 0, max: 0 },
  { label: "1-30 days", min: 1, max: 30 },
  { label: "31-60 days", min: 31, max: 60 },
  { label: "61-90 days", min: 61, max: 90 },
  { label: "90+ days", min: 91, max: Number.POSITIVE_INFINITY },
];

export async function GET() {
  try {
    const user = await requireApiUser();
    requirePermission(user.role, "portfolio", "view");

    const [totals, nplTotals, overdueTotal, byStage, bySector, allExposures] =
      await Promise.all([
        prisma.creditExposure.aggregate({
          _sum: { exposureAmount: true, outstandingBalance: true, eclAmount: true },
        }),
        prisma.creditExposure.aggregate({
          where: { eclStage: "STAGE_3" },
          _sum: { outstandingBalance: true },
        }),
        prisma.creditExposure.aggregate({
          where: { daysPastDue: { gt: 0 } },
          _sum: { outstandingBalance: true },
        }),
        prisma.creditExposure.groupBy({
          by: ["eclStage"],
          _sum: { exposureAmount: true, eclAmount: true },
          _count: true,
        }),
        prisma.creditExposure.groupBy({
          by: ["sector"],
          _sum: { exposureAmount: true },
        }),
        prisma.creditExposure.findMany({
          select: { outstandingBalance: true, daysPastDue: true, collectionStatus: true },
        }),
      ]);

    const totalPortfolio = Number(totals._sum.exposureAmount ?? 0);
    const nplAmount = Number(nplTotals._sum.outstandingBalance ?? 0);
    const eclProvision = Number(totals._sum.eclAmount ?? 0);
    const outstandingTotal = allExposures.reduce(
      (sum, e) => sum + Number(e.outstandingBalance),
      0,
    );
    const collectedBalance = allExposures
      .filter((e) => e.collectionStatus === "CURRENT" || e.collectionStatus === "RECOVERED")
      .reduce((sum, e) => sum + Number(e.outstandingBalance), 0);

    const summary = {
      totalPortfolio,
      nplAmount,
      nplRatio: totalPortfolio > 0 ? Number(((nplAmount / totalPortfolio) * 100).toFixed(1)) : 0,
      eclProvision,
      eclCoverageRatio: nplAmount > 0 ? Number(((eclProvision / nplAmount) * 100).toFixed(1)) : 0,
      collectionRate:
        outstandingTotal > 0
          ? Number(((collectedBalance / outstandingTotal) * 100).toFixed(1))
          : 0,
      overdueAmount: Number(overdueTotal._sum.outstandingBalance ?? 0),
    };

    const eclStageBreakdown = byStage.map((row) => ({
      stage: toKebab<EclStage>(row.eclStage),
      exposureAmount: Number(row._sum.exposureAmount ?? 0),
      eclAmount: Number(row._sum.eclAmount ?? 0),
      count: row._count,
    }));

    const sectorConcentration = bySector
      .map((row) => ({ label: row.sector, value: Number(row._sum.exposureAmount ?? 0) }))
      .sort((a, b) => b.value - a.value);

    const agingBuckets: AgingBucket[] = AGING_BUCKETS.map((bucket) => {
      const rows = allExposures.filter(
        (e) => e.daysPastDue >= bucket.min && e.daysPastDue <= bucket.max,
      );
      return {
        label: bucket.label,
        amount: rows.reduce((sum, e) => sum + Number(e.outstandingBalance), 0),
        accounts: rows.length,
      };
    });

    return NextResponse.json({
      data: { summary, eclStageBreakdown, sectorConcentration, agingBuckets },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
