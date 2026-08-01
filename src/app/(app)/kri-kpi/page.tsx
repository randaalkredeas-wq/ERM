"use client";

import { Plus } from "lucide-react";

import { Sparkline } from "@/components/charts/Sparkline";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { kriStatusTone } from "@/lib/domain";
import { kris } from "@/lib/mock-data/kri";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const statusChartColor: Record<string, string> = {
  "on-track": "var(--success)",
  "at-risk": "var(--warning)",
  breached: "var(--danger)",
};

export default function KriKpiPage() {
  const { dict } = useLocale();

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.kriKpi.title}
        subtitle={dict.kriKpi.subtitle}
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {dict.kriKpi.addIndicator}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kris.map((kri) => {
          const ratio = Math.min(
            100,
            Math.round((kri.current / kri.target) * 100),
          );
          return (
            <Card key={kri.id} className="flex flex-col gap-4">
              <CardHeader className="mb-0 items-start">
                <div>
                  <p className="text-muted text-xs font-medium">
                    {kri.category}
                  </p>
                  <CardTitle className="mt-1 text-sm leading-snug">
                    {kri.name}
                  </CardTitle>
                </div>
                <Badge tone={kriStatusTone[kri.status]} className="shrink-0">
                  {
                    dict.kriKpi[
                      kri.status === "on-track"
                        ? "onTrack"
                        : kri.status === "at-risk"
                          ? "atRisk"
                          : "breached"
                    ]
                  }
                </Badge>
              </CardHeader>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-foreground text-2xl font-semibold">
                    {kri.current}
                    <span className="text-muted ms-1 text-sm font-normal">
                      {kri.unit}
                    </span>
                  </p>
                  <p className="text-muted text-xs">
                    {dict.kriKpi.target}: {kri.target} {kri.unit}
                  </p>
                </div>
                <div className="h-11 w-24">
                  <Sparkline
                    data={kri.trend}
                    color={statusChartColor[kri.status]}
                  />
                </div>
              </div>

              <div>
                <Progress
                  value={ratio}
                  indicatorClassName={cn(
                    kri.status === "breached" && "bg-danger",
                    kri.status === "at-risk" && "bg-warning",
                    kri.status === "on-track" && "bg-success",
                  )}
                />
                <p className="text-muted mt-1.5 text-xs">{dict.kriKpi.trend}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
