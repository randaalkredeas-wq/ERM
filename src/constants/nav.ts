import {
  AlertTriangle,
  BarChart3,
  CheckSquare,
  FileText,
  Gauge,
  History,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Sparkles,
  Thermometer,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { Dictionary } from "@/lib/i18n";
import type { Module } from "@/lib/permissions";

export type NavLabelKey = Exclude<keyof Dictionary["nav"], "group">;

export interface NavLeaf {
  href: string;
  icon: LucideIcon;
  labelKey: NavLabelKey;
  module: Module;
}

export interface NavGroup {
  key: keyof Dictionary["nav"]["group"];
  items: NavLeaf[];
}

export const navGroups: NavGroup[] = [
  {
    key: "overview",
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        labelKey: "dashboard",
        module: "dashboard",
      },
    ],
  },
  {
    key: "risk",
    items: [
      {
        href: "/risk-register",
        icon: ShieldAlert,
        labelKey: "riskRegister",
        module: "riskRegister",
      },
      {
        href: "/portfolio",
        icon: Wallet,
        labelKey: "portfolio",
        module: "portfolio",
      },
      {
        href: "/heat-map",
        icon: Thermometer,
        labelKey: "heatMap",
        module: "heatMap",
      },
      {
        href: "/incidents",
        icon: AlertTriangle,
        labelKey: "incidents",
        module: "incidents",
      },
      { href: "/kri-kpi", icon: Gauge, labelKey: "kriKpi", module: "kriKpi" },
    ],
  },
  {
    key: "governance",
    items: [
      {
        href: "/approvals",
        icon: CheckSquare,
        labelKey: "approvals",
        module: "approvals",
      },
      {
        href: "/audit-log",
        icon: History,
        labelKey: "auditLog",
        module: "auditLog",
      },
      {
        href: "/documents",
        icon: FileText,
        labelKey: "documents",
        module: "documents",
      },
    ],
  },
  {
    key: "intelligence",
    items: [
      {
        href: "/ai-insights",
        icon: Sparkles,
        labelKey: "aiInsights",
        module: "aiInsights",
      },
      {
        href: "/reports",
        icon: BarChart3,
        labelKey: "reports",
        module: "reports",
      },
    ],
  },
  {
    key: "admin",
    items: [
      { href: "/users", icon: Users, labelKey: "users", module: "users" },
      {
        href: "/settings",
        icon: Settings,
        labelKey: "settings",
        module: "settings",
      },
    ],
  },
];

export const allNavItems: NavLeaf[] = navGroups.flatMap((group) => group.items);
