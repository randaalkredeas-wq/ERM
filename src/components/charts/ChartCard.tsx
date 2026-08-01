import { type ReactNode } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  legend?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  actions,
  legend,
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        {actions}
      </CardHeader>
      <div className="flex-1">{children}</div>
      {legend && (
        <div className="border-border text-muted mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs">
          {legend}
        </div>
      )}
    </Card>
  );
}

export function ChartLegendItem({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
