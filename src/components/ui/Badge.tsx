import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
  "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted border-border",
  primary: "bg-primary-container text-on-primary-container border-transparent",
  success: "bg-success-container text-success border-transparent",
  warning: "bg-warning-container text-warning border-transparent",
  danger: "bg-danger-container text-danger border-transparent",
  info: "bg-info-container text-info border-transparent",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({
  className,
  tone = "neutral",
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
