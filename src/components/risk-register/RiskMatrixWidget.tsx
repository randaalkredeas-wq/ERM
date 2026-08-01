"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface MatrixPoint {
  likelihood: number;
  impact: number;
}

interface RiskMatrixWidgetProps {
  current: MatrixPoint;
  inherent?: MatrixPoint;
  target?: MatrixPoint;
  onChange?: (point: MatrixPoint) => void;
  likelihoodLabel: string;
  impactLabel: string;
  currentLabel: string;
  inherentLabel?: string;
  targetLabel?: string;
  className?: string;
}

const levels = [1, 2, 3, 4, 5];

function severityClasses(score: number) {
  if (score >= 20) return "bg-danger/85";
  if (score >= 12) return "bg-[#f97316]/85";
  if (score >= 6) return "bg-warning/85";
  return "bg-success/85";
}

function markerPosition(point: MatrixPoint) {
  return {
    left: `${((point.impact - 0.5) / 5) * 100}%`,
    top: `${((5 - point.likelihood + 0.5) / 5) * 100}%`,
  };
}

export function RiskMatrixWidget({
  current,
  inherent,
  target,
  onChange,
  likelihoodLabel,
  impactLabel,
  currentLabel,
  inherentLabel,
  targetLabel,
  className,
}: RiskMatrixWidgetProps) {
  const interactive = Boolean(onChange);

  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex flex-col items-center justify-center pb-8">
        <span className="text-muted rotate-180 text-[10px] font-semibold tracking-wide whitespace-nowrap [writing-mode:vertical-rl]">
          {likelihoodLabel}
        </span>
      </div>
      <div className="flex-1">
        <div className="relative grid grid-cols-5 gap-1.5">
          {[...levels].reverse().map((likelihood) =>
            levels.map((impact) => {
              const score = likelihood * impact;
              return (
                <button
                  key={`${likelihood}-${impact}`}
                  type="button"
                  disabled={!interactive}
                  onClick={() => onChange?.({ likelihood, impact })}
                  className={cn(
                    "aspect-square rounded-md opacity-80 transition-opacity",
                    severityClasses(score),
                    interactive
                      ? "cursor-pointer hover:opacity-100"
                      : "cursor-default",
                  )}
                />
              );
            }),
          )}

          {inherent && (
            <span
              className="border-foreground/60 pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed"
              style={markerPosition(inherent)}
              title={inherentLabel}
            />
          )}

          {target && (
            <span
              className="bg-background border-foreground pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2"
              style={markerPosition(target)}
              title={targetLabel}
            />
          )}

          <motion.div
            className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2"
            animate={markerPosition(current)}
            transition={{ type: "spring", stiffness: 480, damping: 32 }}
          >
            <span
              className="bg-foreground ring-background block h-full w-full rounded-full shadow-md ring-2"
              title={currentLabel}
            />
          </motion.div>
        </div>
        <div className="text-muted mt-1.5 grid grid-cols-5 gap-1.5 text-center text-[10px] font-medium">
          {levels.map((impact) => (
            <span key={impact}>{impact}</span>
          ))}
        </div>
        <p className="text-muted mt-1 text-center text-[10px] font-semibold tracking-wide">
          {impactLabel}
        </p>
      </div>
    </div>
  );
}
