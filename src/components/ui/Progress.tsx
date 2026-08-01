"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends ComponentProps<typeof ProgressPrimitive.Root> {
  value: number;
  indicatorClassName?: string;
}

export function Progress({
  className,
  value,
  indicatorClassName,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      className={cn(
        "bg-surface-2 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "bg-primary h-full flex-1 rounded-full transition-transform duration-500 ease-out",
          indicatorClassName,
        )}
        style={{
          transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
}
