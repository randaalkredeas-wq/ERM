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

export type NavLabelKey = Exclude<keyof Dictionary["nav"], "group">;

export interface NavLeaf {
  href: string;
  icon: LucideIcon;
  labelKey: NavLabelKey;
}

export interface NavGroup {
  key: keyof Dictionary["nav"]["group"];
  items: NavLeaf[];
}

export const navGroups: NavGroup[] = [
  {
    key: "overview",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
    ],
  },
  {
    key: "risk",
    items: [
      { href: "/risk-register", icon: ShieldAlert, labelKey: "riskRegister" },
      { href: "/portfolio", icon: Wallet, labelKey: "portfolio" },
      { href: "/heat-map", icon: Thermometer, labelKey: "heatMap" },
      { href: "/incidents", icon: AlertTriangle, labelKey: "incidents" },
      { href: "/kri-kpi", icon: Gauge, labelKey: "kriKpi" },
    ],
  },
  {
    key: "governance",
    items: [
      { href: "/approvals", icon: CheckSquare, labelKey: "approvals" },
      { href: "/audit-log", icon: History, labelKey: "auditLog" },
      { href: "/documents", icon: FileText, labelKey: "documents" },
    ],
  },
  {
    key: "intelligence",
    items: [
      { href: "/ai-insights", icon: Sparkles, labelKey: "aiInsights" },
      { href: "/reports", icon: BarChart3, labelKey: "reports" },
    ],
  },
  {
    key: "admin",
    items: [
      { href: "/users", icon: Users, labelKey: "users" },
      { href: "/settings", icon: Settings, labelKey: "settings" },
    ],
  },
];

export const allNavItems: NavLeaf[] = navGroups.flatMap((group) => group.items);
