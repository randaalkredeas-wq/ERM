import { type ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/dal";

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  return <AppShell user={user}>{children}</AppShell>;
}
