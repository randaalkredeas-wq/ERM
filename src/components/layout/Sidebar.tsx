"use client";

import { ChevronsLeft, ShieldHalf, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSidebar } from "@/components/layout/sidebar-context";
import { navGroups } from "@/constants/nav";
import { siteConfig } from "@/config/site";
import type { CurrentUser } from "@/lib/dal";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

export function Sidebar({ user }: { user: CurrentUser }) {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } =
    useSidebar();
  const pathname = usePathname();
  const { dict, dir } = useLocale();
  const collapseIconRotated = collapsed !== (dir === "rtl");

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(user.role, item.module, "view")),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        style={{ backgroundImage: "var(--sidebar-bg)" }}
        className={cn(
          "border-sidebar-border text-sidebar-foreground fixed inset-y-0 start-0 z-40 flex flex-col border-e transition-all duration-300 ease-in-out lg:translate-x-0 print:hidden",
          collapsed ? "w-20" : "w-72",
          mobileOpen
            ? "translate-x-0"
            : "max-lg:-translate-x-full max-lg:rtl:translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
              <ShieldHalf className="h-5 w-5" />
            </span>
            {!collapsed && (
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">
                  {siteConfig.name}
                </span>
                <span className="text-sidebar-muted text-[11px]">
                  {siteConfig.fullName}
                </span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-muted hover:bg-sidebar-hover rounded-lg p-1.5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 scrollbar-thin space-y-6 overflow-y-auto px-3 py-4">
          {visibleGroups.map((group) => (
            <div key={group.key}>
              {!collapsed && (
                <p className="text-sidebar-muted mb-2 px-3 text-[11px] font-semibold tracking-wider uppercase">
                  {dict.nav.group[group.key]}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? dict.nav[item.labelKey] : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-sidebar-active text-white"
                            : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white",
                          collapsed && "justify-center px-0",
                        )}
                      >
                        {active && (
                          <span className="bg-primary absolute inset-y-1 start-0 w-1 rounded-full" />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <span className="truncate">
                            {dict.nav[item.labelKey]}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-sidebar-border border-t p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "text-sidebar-muted hover:bg-sidebar-hover flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:text-white",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? dict.common.expand : dict.common.collapse}
          >
            <ChevronsLeft
              className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform",
                collapseIconRotated && "rotate-180",
              )}
            />
            {!collapsed && <span>{dict.common.collapse}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
