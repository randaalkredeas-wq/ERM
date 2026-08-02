import type { ReactNode } from "react";

export function AuthPageBackground({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background flex min-h-screen items-center justify-center p-4"
      style={{ backgroundImage: "var(--sidebar-bg)" }}
    >
      {children}
    </div>
  );
}
