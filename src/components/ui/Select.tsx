import { ChevronDown } from "lucide-react";
import { type SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "border-border bg-surface text-foreground focus-visible:ring-ring h-10 w-full appearance-none rounded-lg border ps-3 pe-9 text-sm focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="text-muted pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2" />
    </div>
  );
});

Select.displayName = "Select";
