import type { ReactNode } from "react";

import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function AuthPageBackground({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background relative flex min-h-screen items-center justify-center p-4"
      style={{ backgroundImage: "var(--sidebar-bg)" }}
    >
      <LanguageToggle className="absolute end-4 top-4" />
      {children}
    </div>
  );
}
