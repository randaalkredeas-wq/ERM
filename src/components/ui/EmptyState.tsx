import { type LucideIcon } from "lucide-react";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border-border-strong flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="bg-primary-container text-on-primary-container flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-foreground font-semibold">{title}</p>
        {description && (
          <p className="text-muted mt-1 max-w-sm text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
