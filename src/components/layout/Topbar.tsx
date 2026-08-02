"use client";

import {
  AlertTriangle,
  Bell,
  CalendarClock,
  KeyRound,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useRiskRegister } from "@/app/(app)/risk-register/risk-register-context";
import { useSidebar } from "@/components/layout/sidebar-context";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { MockUser } from "@/lib/mock-auth";
import { isReviewDue, isTreatmentActionOverdue } from "@/lib/domain";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
} from "@/lib/notifications-store";
import { cn, getInitials } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import { useMockAuth } from "@/providers/mock-auth-provider";

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export function Topbar({ user }: { user: MockUser }) {
  const { setMobileOpen } = useSidebar();
  const initials = getInitials(user.name);
  const { dict } = useLocale();
  const router = useRouter();
  const { logout } = useMockAuth();
  const notifications = useNotifications();
  const { risks } = useRiskRegister();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeRisks = risks.filter((r) => !r.isArchived && r.status !== "closed");
  const today = new Date().toISOString().slice(0, 10);
  const overdueRisksCount = activeRisks.filter((r) => r.dueDate < today).length;
  const overdueActionsCount = activeRisks.reduce(
    (sum, r) => sum + r.treatmentPlans.filter(isTreatmentActionOverdue).length,
    0,
  );
  const reviewsDueCount = activeRisks.filter((r) => isReviewDue(r)).length;
  const hasReminders =
    overdueRisksCount > 0 || overdueActionsCount > 0 || reviewsDueCount > 0;

  return (
    <header className="glass border-border print:hidden sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="text-muted hover:bg-surface-2 flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative w-full max-w-md">
        <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={dict.common.search}
          className="ps-9"
        />
      </div>

      <div className="ms-auto flex items-center gap-2">
        <ThemeToggle className="hidden sm:flex" />
        <LanguageToggle className="hidden md:flex" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="text-muted hover:bg-surface-2 hover:text-foreground relative flex h-9 w-9 items-center justify-center rounded-full transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {(unreadCount > 0 || hasReminders) && (
                <span className="bg-danger ring-background absolute end-1.5 top-1.5 flex h-2 w-2 rounded-full ring-2" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <DropdownMenuLabel className="text-foreground p-0 text-sm">
                {dict.common.notifications}
              </DropdownMenuLabel>
              {unreadCount > 0 && <Badge tone="primary">{unreadCount}</Badge>}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <p className="text-muted px-2.5 py-4 text-center text-sm">
                {dict.common.noNotifications}
              </p>
            ) : (
              <div className="max-h-72 scrollbar-thin space-y-0.5 overflow-y-auto">
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex-col items-start gap-1 py-2.5"
                    onSelect={(e) => {
                      e.preventDefault();
                      markNotificationRead(n.id);
                    }}
                  >
                    <div className="flex w-full items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          toneDot[n.tone],
                          n.read && "opacity-30",
                        )}
                      />
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm",
                            n.read ? "text-muted" : "text-foreground font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="text-muted mt-0.5 text-xs">
                          {n.description}
                        </p>
                        <p className="text-muted mt-1 text-[11px]">{n.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
            {hasReminders && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-muted px-2.5 py-1 text-xs">
                  {dict.common.reminders}
                </DropdownMenuLabel>
                {overdueRisksCount > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/risk-register" className="gap-2 text-sm">
                      <AlertTriangle className="text-danger h-4 w-4 shrink-0" />
                      {dict.common.overdueRisksReminder.replace(
                        "{count}",
                        String(overdueRisksCount),
                      )}
                    </Link>
                  </DropdownMenuItem>
                )}
                {overdueActionsCount > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/risk-register" className="gap-2 text-sm">
                      <AlertTriangle className="text-danger h-4 w-4 shrink-0" />
                      {dict.common.overdueActionsReminder.replace(
                        "{count}",
                        String(overdueActionsCount),
                      )}
                    </Link>
                  </DropdownMenuItem>
                )}
                {reviewsDueCount > 0 && (
                  <DropdownMenuItem asChild>
                    <Link href="/risk-register" className="gap-2 text-sm">
                      <CalendarClock className="text-warning h-4 w-4 shrink-0" />
                      {dict.common.reviewsDueReminder.replace(
                        "{count}",
                        String(reviewsDueCount),
                      )}
                    </Link>
                  </DropdownMenuItem>
                )}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-primary justify-center text-sm font-medium"
              disabled={unreadCount === 0}
              onSelect={(e) => {
                e.preventDefault();
                markAllNotificationsRead();
              }}
            >
              {dict.common.markAllRead}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-surface-2 flex items-center gap-2 rounded-full py-1 ps-1 pe-1 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  {user.name}
                </p>
                <p className="text-muted truncate text-xs">{user.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="h-4 w-4" />
                {dict.common.myProfile}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                {dict.common.accountSettings}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="h-4 w-4" />
              {dict.settings.security.changePassword}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger"
              onSelect={(e) => {
                e.preventDefault();
                logout();
                router.push("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
              {dict.common.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
