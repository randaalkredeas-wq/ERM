import "server-only";

import type { KriIndicator } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { KriItem } from "@/types";

export function serializeKri(kri: KriIndicator): KriItem {
  return {
    id: kri.code,
    name: kri.name,
    category: kri.category,
    current: kri.current,
    target: kri.target,
    unit: kri.unit,
    trend: kri.trend,
    status: toKebab(kri.status),
  };
}
