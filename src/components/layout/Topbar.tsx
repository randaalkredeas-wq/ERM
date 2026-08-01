"use client";

import {
  Bell,
  KeyRound,
  LogOut,
  Menu,
  Search,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";

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
import { notifications } from "@/lib/mock-data/notifications";
import { cn } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";

const toneDot: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

export function Topbar() {
  const { setMobileOpen } = useSidebar();
  const { dict } = useLocale();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="glass border-border sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
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
              {unreadCount > 0 && (
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
            <div className="max-h-80 scrollbar-thin space-y-0.5 overflow-y-auto">
              {notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  className="flex-col items-start gap-1 py-2.5"
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary justify-center text-sm font-medium">
              {dict.common.viewAll}
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
                <AvatarFallback>LH</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <div className="flex items-center gap-3 px-2.5 py-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>LH</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-foreground truncate text-sm font-semibold">
                  Layla Haddad
                </p>
                <p className="text-muted truncate text-xs">
                  layla.haddad@ermcorp.com
                </p>
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
            <DropdownMenuItem className="text-danger">
              <LogOut className="h-4 w-4" />
              {dict.common.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
