"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const options = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Laptop },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { dict } = useLocale();
  const mounted = useIsClient();

  return (
    <div
      className={cn(
        "border-border bg-surface-2 flex items-center gap-0.5 rounded-full border p-1",
        className,
      )}
      role="radiogroup"
      aria-label={dict.common.theme}
    >
      {options.map(({ value, icon: Icon }) => {
        const active = mounted && theme === value;
        const label =
          value === "light"
            ? dict.common.lightMode
            : value === "dark"
              ? dict.common.darkMode
              : dict.common.system;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted hover:bg-surface hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
