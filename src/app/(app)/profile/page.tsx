"use client";

import {
  Building2,
  Calendar,
  KeyRound,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { apiClient } from "@/lib/api-client";
import type { CurrentUser } from "@/lib/dal";
import { ROLE_LABELS } from "@/lib/role-labels";
import { formatDate, getInitials } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { AuditLogEntry } from "@/types";

export default function ProfilePage() {
  const { dict } = useLocale();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [activity, setActivity] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: CurrentUser }>("/api/me")
      .then((res) => {
        setUser(res.data);
        // Roles without audit-log access (e.g. Employee, Read-only
        // Executive) simply see no recent-activity list.
        return apiClient
          .get<{ data: AuditLogEntry[] }>(
            `/api/audit-log?userId=${res.data.id}&pageSize=20`,
          )
          .then((activityRes) => setActivity(activityRes.data))
          .catch(() => {});
      });
  }, []);

  if (!user) return null;

  const infoItems = [
    { icon: Mail, label: "email" as const, value: user.email },
    { icon: Phone, label: "phone" as const, value: user.phone || "—" },
    { icon: Building2, label: "department" as const, value: user.department || "—" },
    { icon: MapPin, label: "location" as const, value: user.location || "—" },
    {
      icon: Calendar,
      label: "joined" as const,
      value: formatDate(user.createdAt, dict.meta.locale),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.profile.title}
        subtitle={dict.profile.subtitle}
        actions={
          <Button size="sm">
            <Pencil className="h-4 w-4" />
            {dict.profile.editProfile}
          </Button>
        }
      />

      <Card className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-start">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-xl">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-foreground text-xl font-semibold">
            {user.name}
          </h2>
          <p className="text-muted text-sm">
            {user.jobTitle || ROLE_LABELS[user.role]}
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
            {user.department && <Badge tone="primary">{user.department}</Badge>}
            <Badge tone="success" dot>
              {dict.common.active}
            </Badge>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            {dict.profile.tabs.overview}
          </TabsTrigger>
          <TabsTrigger value="activity">
            {dict.profile.tabs.activity}
          </TabsTrigger>
          <TabsTrigger value="security">
            {dict.profile.tabs.security}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="max-w-2xl">
            <CardTitle className="mb-4">{dict.profile.title}</CardTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="bg-surface-2 text-muted flex h-9 w-9 items-center justify-center rounded-lg">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-muted text-xs">
                      {dict.profile[item.label]}
                    </p>
                    <p className="text-foreground text-sm font-medium">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-0">
            <div className="p-6 pb-0">
              <CardTitle>{dict.profile.recentActivity}</CardTitle>
            </div>
            <div className="divide-border mt-4 divide-y">
              {activity.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start justify-between gap-4 px-6 py-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {entry.action}
                    </p>
                    <p className="text-muted text-xs">{entry.details}</p>
                  </div>
                  <span className="text-muted shrink-0 text-xs">
                    {entry.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="divide-border max-w-2xl divide-y">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="bg-success-container text-success flex h-9 w-9 items-center justify-center rounded-lg">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {dict.settings.security.twoFactor}
                  </p>
                  <p className="text-muted text-xs">{dict.common.active}</p>
                </div>
              </div>
              <Badge tone="success">{dict.common.active}</Badge>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="bg-surface-2 text-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <KeyRound className="h-4 w-4" />
                </span>
                <p className="text-foreground text-sm font-medium">
                  {dict.settings.security.changePassword}
                </p>
              </div>
              <Button size="sm" variant="outline">
                {dict.settings.security.changePassword}
              </Button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <span className="bg-surface-2 text-muted flex h-9 w-9 items-center justify-center rounded-lg">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-foreground text-sm font-medium">
                    iPhone 16 Pro · Riyadh
                  </p>
                  <p className="text-muted text-xs">
                    {dict.common.today}, 09:14
                  </p>
                </div>
              </div>
              <Badge tone="neutral">{dict.common.active}</Badge>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
