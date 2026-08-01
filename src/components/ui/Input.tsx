import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "border-border bg-surface text-foreground placeholder:text-muted focus-visible:ring-ring h-10 w-full rounded-lg border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
