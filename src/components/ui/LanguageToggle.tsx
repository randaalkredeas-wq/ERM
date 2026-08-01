"use client";

import { Languages } from "lucide-react";

import { useLocale } from "@/providers/locale-provider";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, toggleLocale, dict } = useLocale();

  return (
    <button
      type="button"
      onClick={toggleLocale}
      title={dict.common.language}
      className={cn(
        "border-border bg-surface-2 text-foreground hover:bg-surface flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors",
        className,
      )}
    >
      <Languages className="text-muted h-4 w-4" />
      {locale === "en" ? "العربية" : "English"}
    </button>
  );
}
