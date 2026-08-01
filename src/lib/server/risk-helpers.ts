import "server-only";

import { BadRequestError, NotFoundError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { riskInclude, type RiskWithRelations } from "@/lib/serializers/risk";

export async function resolveUserIdByName(name: string): Promise<string> {
  const user = await prisma.user.findFirst({ where: { name }, select: { id: true } });
  if (!user) throw new BadRequestError(`Unknown user "${name}".`);
  return user.id;
}

/** Bare risk row (no relations) - cheap lookup for ownership/permission checks. */
export async function findRiskRowByCode(code: string) {
  const risk = await prisma.risk.findUnique({ where: { code } });
  if (!risk) throw new NotFoundError(`Risk ${code} not found.`);
  return risk;
}

export async function findRiskWithRelationsByCode(
  code: string,
): Promise<RiskWithRelations> {
  const risk = await prisma.risk.findUnique({
    where: { code },
    include: riskInclude,
  });
  if (!risk) throw new NotFoundError(`Risk ${code} not found.`);
  return risk;
}

/** Generates the next sequential RSK-#### code. */
export async function generateNextRiskCode(): Promise<string> {
  const rows = await prisma.risk.findMany({ select: { code: true } });
  const max = rows.reduce((acc, r) => {
    const num = Number(r.code.replace("RSK-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 1000);
  return `RSK-${max + 1}`;
}
