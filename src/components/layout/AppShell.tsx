"use client";

import { type ReactNode } from "react";

import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PageTransition } from "@/components/layout/PageTransition";
import { Sidebar } from "@/components/layout/Sidebar";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/sidebar-context";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/lib/dal";

function AppShellInner({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser;
}) {
  const { collapsed } = useSidebar();

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out print:ps-0",
          collapsed ? "lg:ps-20" : "lg:ps-72",
        )}
      >
        <Topbar user={user} />
        <Breadcrumbs />
        <main className="flex-1 scrollbar-thin p-4 sm:p-6 lg:p-8 print:p-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentUser;
}) {
  return (
    <SidebarProvider>
      <AppShellInner user={user}>{children}</AppShellInner>
    </SidebarProvider>
  );
}
