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

function AppShellInner({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="bg-background min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out",
          collapsed ? "lg:ps-20" : "lg:ps-72",
        )}
      >
        <Topbar />
        <Breadcrumbs />
        <main className="flex-1 scrollbar-thin p-4 sm:p-6 lg:p-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}
