"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { allNavItems } from "@/constants/nav";
import { useLocale } from "@/providers/locale-provider";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { dict } = useLocale();

  const segments = (pathname ?? "").split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const navItem = allNavItems.find((item) => item.href === href);
    const label = navItem
      ? dict.nav[navItem.labelKey]
      : segment.replace(/-/g, " ");
    return { href, label };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-border text-muted print:hidden flex items-center gap-1.5 border-b px-4 py-3 text-sm sm:px-6"
    >
      <Link
        href="/dashboard"
        className="hover:text-foreground flex items-center gap-1.5 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        {dict.common.home}
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <Fragment key={crumb.href}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 rtl:rotate-180" />
            {isLast ? (
              <span className="text-foreground font-medium capitalize">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-foreground capitalize transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
