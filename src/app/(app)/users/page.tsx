"use client";

import { ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { apiClient } from "@/lib/api-client";
import { userStatusTone } from "@/lib/domain";
import { formatDate, getInitials } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { UserItem } from "@/types";

export default function UsersPage() {
  const { dict } = useLocale();
  const [users, setUsers] = useState<UserItem[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: UserItem[] }>("/api/users?pageSize=200")
      .then((res) => setUsers(res.data));
  }, []);

  const active = users.filter((u) => u.status === "active").length;
  const admins = users.filter(
    (u) =>
      u.role.toLowerCase().includes("officer") ||
      u.role.toLowerCase().includes("lead"),
  ).length;
  const invited = users.filter((u) => u.status === "invited").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.users.title}
        subtitle={dict.users.subtitle}
        actions={
          <Button size="sm">
            <UserPlus className="h-4 w-4" />
            {dict.users.inviteUser}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.users.totalUsers}
          value={String(users.length)}
          icon={UsersIcon}
          tone="primary"
        />
        <StatCard
          label={dict.users.activeUsers}
          value={String(active)}
          icon={UsersIcon}
          tone="success"
        />
        <StatCard
          label={dict.users.administrators}
          value={String(admins)}
          icon={ShieldCheck}
          tone="info"
        />
        <StatCard
          label={dict.users.pendingInvites}
          value={String(invited)}
          icon={UserPlus}
          tone="warning"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{dict.users.columns.name}</TableHead>
            <TableHead>{dict.users.columns.role}</TableHead>
            <TableHead>{dict.users.columns.department}</TableHead>
            <TableHead>{dict.users.columns.status}</TableHead>
            <TableHead>{dict.users.columns.lastLogin}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-foreground font-medium">{user.name}</p>
                    <p className="text-muted text-xs">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted">{user.role}</TableCell>
              <TableCell className="text-muted">{user.department}</TableCell>
              <TableCell>
                <Badge tone={userStatusTone[user.status]} dot>
                  {
                    dict.common[
                      user.status === "invited" ? "pending" : user.status
                    ]
                  }
                </Badge>
              </TableCell>
              <TableCell className="text-muted">
                {user.lastLogin === "—"
                  ? "—"
                  : formatDate(user.lastLogin.split(" ")[0], dict.meta.locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
