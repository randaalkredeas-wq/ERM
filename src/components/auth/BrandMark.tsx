import { ShieldHalf } from "lucide-react";

export function BrandMark({
  brand,
  title,
  subtitle,
}: {
  brand?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="gradient-primary flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg">
        <ShieldHalf className="h-7 w-7" />
      </span>
      <div>
        {brand && (
          <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
            {brand}
          </p>
        )}
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="text-muted mt-1 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
