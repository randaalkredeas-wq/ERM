import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { CreditExposure } from "@/types";

export type CreditExposureWithCollector = Prisma.CreditExposureGetPayload<{
  include: { collector: true };
}>;

export function serializeCreditExposure(
  exposure: CreditExposureWithCollector,
): CreditExposure {
  return {
    id: exposure.code,
    customerName: exposure.customerName,
    segment: exposure.segment,
    sector: exposure.sector,
    product: exposure.product,
    exposureAmount: Number(exposure.exposureAmount),
    outstandingBalance: Number(exposure.outstandingBalance),
    daysPastDue: exposure.daysPastDue,
    eclStage: toKebab(exposure.eclStage),
    eclAmount: Number(exposure.eclAmount),
    riskRating: exposure.riskRating,
    collectionStatus: toKebab(exposure.collectionStatus),
    collector: exposure.collector?.name ?? "Unassigned",
    lastPaymentDate: exposure.lastPaymentDate
      ? exposure.lastPaymentDate.toISOString().slice(0, 10)
      : "",
    nextActionDate: exposure.nextActionDate.toISOString().slice(0, 10),
  };
}
