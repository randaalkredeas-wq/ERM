"use client";

import { cn } from "@/lib/utils";

export interface HeatMapCell {
  likelihood: number;
  impact: number;
  count: number;
}

interface RiskHeatMapGridProps {
  cells: HeatMapCell[];
  selected: { likelihood: number; impact: number } | null;
  onSelect: (cell: { likelihood: number; impact: number }) => void;
  likelihoodLabel: string;
  impactLabel: string;
}

const levels = [1, 2, 3, 4, 5];

function severityClasses(score: number) {
  if (score >= 20) return "bg-danger text-white hover:brightness-110";
  if (score >= 12) return "bg-[#f97316] text-white hover:brightness-110";
  if (score >= 6) return "bg-warning text-white hover:brightness-110";
  return "bg-success text-white hover:brightness-110";
}

export function RiskHeatMapGrid({
  cells,
  selected,
  onSelect,
  likelihoodLabel,
  impactLabel,
}: RiskHeatMapGridProps) {
  const lookup = new Map(
    cells.map((cell) => [`${cell.likelihood}-${cell.impact}`, cell.count]),
  );

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center justify-center pb-8">
        <span className="text-muted rotate-180 text-xs font-semibold tracking-wide [writing-mode:vertical-rl]">
          {likelihoodLabel}
        </span>
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-2">
          {[...levels].reverse().map((likelihood) =>
            levels.map((impact) => {
              const score = likelihood * impact;
              const count = lookup.get(`${likelihood}-${impact}`) ?? 0;
              const isSelected =
                selected?.likelihood === likelihood &&
                selected?.impact === impact;
              return (
                <button
                  key={`${likelihood}-${impact}`}
                  type="button"
                  onClick={() => onSelect({ likelihood, impact })}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition-all",
                    severityClasses(score),
                    isSelected
                      ? "ring-primary ring-offset-background ring-2 ring-offset-2"
                      : "opacity-90 hover:opacity-100",
                  )}
                >
                  {count > 0 ? count : ""}
                </button>
              );
            }),
          )}
        </div>
        <div className="text-muted mt-2 grid grid-cols-5 gap-2 text-center text-xs font-medium">
          {levels.map((impact) => (
            <span key={impact}>{impact}</span>
          ))}
        </div>
        <p className="text-muted mt-1 text-center text-xs font-semibold tracking-wide">
          {impactLabel}
        </p>
      </div>
    </div>
  );
}
