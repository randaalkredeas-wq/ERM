import "server-only";

import type { AiInsight } from "@/generated/prisma/client";
import { toKebab } from "@/lib/serializers/risk";
import type { AiInsightItem } from "@/types";

export function serializeAiInsight(insight: AiInsight): AiInsightItem {
  return {
    id: insight.id,
    title: insight.title,
    description: insight.description,
    confidence: insight.confidence,
    category: insight.category,
    severity: toKebab(insight.severity),
    generatedAt: insight.createdAt.toISOString().slice(0, 10),
  };
}
