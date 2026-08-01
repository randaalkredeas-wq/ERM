import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  delta?: {
    value: string;
    direction: "up" | "down";
    positive?: boolean;
    caption?: string;
  };
  className?: string;
}

const toneClasses = {
  primary: "bg-primary-container text-on-primary-container",
  success: "bg-success-container text-success",
  warning: "bg-warning-container text-warning",
  danger: "bg-danger-container text-danger",
  info: "bg-info-container text-info",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  delta,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted text-sm font-medium">{label}</p>
          <p className="text-foreground mt-2 text-3xl font-semibold tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta && (
        <div className="flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium",
              delta.positive
                ? "bg-success-container text-success"
                : "bg-danger-container text-danger",
            )}
          >
            {delta.direction === "up" ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {delta.value}
          </span>
          {delta.caption && <span className="text-muted">{delta.caption}</span>}
        </div>
      )}
    </Card>
  );
}
