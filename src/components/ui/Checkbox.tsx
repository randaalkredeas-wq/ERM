import { Check } from "lucide-react";
import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
          {...props}
        />
        <span
          className={cn(
            "border-border bg-surface peer-checked:bg-primary peer-checked:border-primary pointer-events-none absolute inset-0 rounded transition-colors",
            "peer-focus-visible:ring-ring peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1",
            className,
          )}
        />
        <Check className="text-primary-foreground pointer-events-none relative h-3 w-3 opacity-0 transition-opacity peer-checked:opacity-100" />
      </span>
    );
  },
);

Checkbox.displayName = "Checkbox";
