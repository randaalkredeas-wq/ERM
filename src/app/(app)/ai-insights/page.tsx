"use client";

import { Send, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { apiClient } from "@/lib/api-client";
import { severityTone } from "@/lib/domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { AiInsightItem } from "@/types";

export default function AiInsightsPage() {
  const { dict } = useLocale();
  const [insights, setInsights] = useState<AiInsightItem[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: AiInsightItem[] }>("/api/ai-insights?pageSize=50")
      .then((res) => setInsights(res.data))
      .catch(() => {});
  }, []);

  const dismiss = (id: string) =>
    setInsights((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.aiInsights.title}
        subtitle={dict.aiInsights.subtitle}
        actions={
          <Badge tone="primary" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {dict.common.poweredByAi}
          </Badge>
        }
      />

      <p className="text-muted text-sm font-medium">
        {dict.aiInsights.newFindings}: {insights.length}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {insights.map((insight) => (
          <Card key={insight.id} className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="gradient-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
                <Sparkles className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-foreground font-semibold">
                    {insight.title}
                  </p>
                  <Badge tone={severityTone[insight.severity]}>
                    {dict.common[insight.severity]}
                  </Badge>
                </div>
                <p className="text-muted mt-1 text-xs">
                  {insight.category} ·{" "}
                  {formatDate(insight.generatedAt, dict.meta.locale)}
                </p>
              </div>
            </div>

            <p className="text-muted text-sm">{insight.description}</p>

            <div className="border-border flex items-center justify-between border-t pt-3">
              <div className="text-muted flex items-center gap-2 text-xs">
                <span>{dict.aiInsights.confidence}</span>
                <div className="bg-surface-2 h-1.5 w-24 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
                <span className="text-foreground font-medium">
                  {insight.confidence}%
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {dict.aiInsights.accept}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismiss(insight.id)}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  {dict.aiInsights.dismiss}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="glass sticky bottom-4 flex items-center gap-3 rounded-2xl p-4 shadow-lg">
        <span className="gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
          <Sparkles className="h-4 w-4" />
        </span>
        <Input
          placeholder={dict.aiInsights.askAssistant}
          className="border-0 bg-transparent focus-visible:ring-0"
        />
        <Button size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
