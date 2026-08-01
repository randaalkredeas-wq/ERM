"use client";

import { Thermometer } from "lucide-react";
import { useMemo, useState } from "react";

import { RiskHeatMapGrid } from "@/components/charts/RiskHeatMapGrid";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { riskScore, severityFromScore, severityTone } from "@/lib/domain";
import { risks } from "@/lib/mock-data/risks";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const legendItems = [
  { tone: "bg-success", label: "low" as const },
  { tone: "bg-warning", label: "medium" as const },
  { tone: "bg-[#f97316]", label: "high" as const },
  { tone: "bg-danger", label: "critical" as const },
];

export default function HeatMapPage() {
  const { dict } = useLocale();
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<{
    likelihood: number;
    impact: number;
  } | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(risks.map((r) => r.category))),
    [],
  );

  const filteredRisks = useMemo(
    () =>
      category === "all" ? risks : risks.filter((r) => r.category === category),
    [category],
  );

  const cells = useMemo(() => {
    const map = new Map<string, number>();
    filteredRisks.forEach((r) => {
      const key = `${r.likelihood}-${r.impact}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([key, count]) => {
      const [likelihood, impact] = key.split("-").map(Number);
      return { likelihood, impact, count };
    });
  }, [filteredRisks]);

  const selectedRisks = selected
    ? filteredRisks.filter(
        (r) =>
          r.likelihood === selected.likelihood && r.impact === selected.impact,
      )
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title={dict.heatMap.title} subtitle={dict.heatMap.subtitle} />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            category === "all"
              ? "border-primary bg-primary-container text-on-primary-container"
              : "border-border text-muted hover:bg-surface-2",
          )}
        >
          {dict.common.all}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              category === c
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-border text-muted hover:bg-surface-2",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{dict.heatMap.title}</CardTitle>
          </CardHeader>
          <RiskHeatMapGrid
            cells={cells}
            selected={selected}
            onSelect={setSelected}
            likelihoodLabel={dict.heatMap.likelihood}
            impactLabel={dict.heatMap.impact}
          />
          <div className="border-border text-muted mt-6 flex flex-wrap items-center gap-4 border-t pt-4 text-xs">
            <span className="text-foreground font-semibold">
              {dict.heatMap.legend}
            </span>
            {legendItems.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", item.tone)} />
                {dict.common[item.label]}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dict.heatMap.risksInCell}</CardTitle>
          </CardHeader>
          {!selected ? (
            <EmptyState icon={Thermometer} title={dict.heatMap.selectCell} />
          ) : selectedRisks.length === 0 ? (
            <EmptyState icon={Thermometer} title={dict.common.noResults} />
          ) : (
            <div className="max-h-96 scrollbar-thin space-y-3 overflow-y-auto">
              {selectedRisks.map((risk) => {
                const score = riskScore(risk);
                return (
                  <div
                    key={risk.id}
                    className="border-border rounded-lg border p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-foreground text-sm font-medium">
                        {risk.title}
                      </p>
                      <Badge tone={severityTone[severityFromScore(score)]}>
                        {score}
                      </Badge>
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      {risk.id} · {risk.category} · {risk.owner}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
