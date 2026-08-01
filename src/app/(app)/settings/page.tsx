"use client";

import { type ReactNode, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Select } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLocale } from "@/providers/locale-provider";

const integrations = [
  { name: "Microsoft Entra ID", connected: true },
  { name: "Slack", connected: true },
  { name: "ServiceNow", connected: false },
  { name: "Jira", connected: false },
];

function SettingRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-foreground text-sm font-medium">{title}</p>
        {description && (
          <p className="text-muted mt-0.5 text-xs">{description}</p>
        )}
      </div>
      {control}
    </div>
  );
}

export default function SettingsPage() {
  const { dict } = useLocale();
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    push: true,
    weeklyDigest: false,
    riskAlerts: true,
  });
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.settings.title}
        subtitle={dict.settings.subtitle}
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            {dict.settings.tabs.general}
          </TabsTrigger>
          <TabsTrigger value="appearance">
            {dict.settings.tabs.appearance}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            {dict.settings.tabs.notifications}
          </TabsTrigger>
          <TabsTrigger value="security">
            {dict.settings.tabs.security}
          </TabsTrigger>
          <TabsTrigger value="integrations">
            {dict.settings.tabs.integrations}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="max-w-2xl space-y-5">
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.settings.general.orgName}
              </label>
              <Input defaultValue="ERM Corp Holdings" />
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.settings.general.timezone}
              </label>
              <Select defaultValue="gmt3">
                <option value="gmt3">(GMT+3) Riyadh, Kuwait</option>
                <option value="gmt0">(GMT+0) London</option>
                <option value="gmt-5">(GMT-5) New York</option>
                <option value="gmt8">(GMT+8) Singapore</option>
              </Select>
            </div>
            <div>
              <label className="text-foreground mb-1.5 block text-sm font-medium">
                {dict.settings.general.fiscalYear}
              </label>
              <Select defaultValue="jan">
                <option value="jan">January</option>
                <option value="apr">April</option>
                <option value="jul">July</option>
                <option value="oct">October</option>
              </Select>
            </div>
            <Button>{dict.common.save}</Button>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="divide-border max-w-2xl divide-y">
            <SettingRow
              title={dict.settings.appearance.theme}
              description={dict.settings.appearance.themeHint}
              control={<ThemeToggle />}
            />
            <SettingRow
              title={dict.settings.appearance.language}
              description={dict.settings.appearance.languageHint}
              control={<LanguageToggle />}
            />
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="divide-border max-w-2xl divide-y">
            <SettingRow
              title={dict.settings.notifications.email}
              control={
                <Switch
                  checked={notifPrefs.email}
                  onCheckedChange={(v) =>
                    setNotifPrefs((p) => ({ ...p, email: v }))
                  }
                />
              }
            />
            <SettingRow
              title={dict.settings.notifications.push}
              control={
                <Switch
                  checked={notifPrefs.push}
                  onCheckedChange={(v) =>
                    setNotifPrefs((p) => ({ ...p, push: v }))
                  }
                />
              }
            />
            <SettingRow
              title={dict.settings.notifications.weeklyDigest}
              control={
                <Switch
                  checked={notifPrefs.weeklyDigest}
                  onCheckedChange={(v) =>
                    setNotifPrefs((p) => ({ ...p, weeklyDigest: v }))
                  }
                />
              }
            />
            <SettingRow
              title={dict.settings.notifications.riskAlerts}
              control={
                <Switch
                  checked={notifPrefs.riskAlerts}
                  onCheckedChange={(v) =>
                    setNotifPrefs((p) => ({ ...p, riskAlerts: v }))
                  }
                />
              }
            />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="divide-border max-w-2xl divide-y">
            <SettingRow
              title={dict.settings.security.twoFactor}
              control={
                <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
              }
            />
            <SettingRow
              title={dict.settings.security.sessionTimeout}
              control={
                <Select defaultValue="30" className="w-40">
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                </Select>
              }
            />
            <SettingRow
              title={dict.settings.security.changePassword}
              control={
                <Button variant="outline" size="sm">
                  {dict.settings.security.changePassword}
                </Button>
              }
            />
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card className="max-w-2xl">
            <CardTitle>{dict.settings.integrations.title}</CardTitle>
            <CardDescription className="mb-2">
              {dict.settings.subtitle}
            </CardDescription>
            <Separator className="my-2" />
            <div className="divide-border divide-y">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className="flex items-center justify-between py-3"
                >
                  <p className="text-foreground text-sm font-medium">
                    {integration.name}
                  </p>
                  {integration.connected ? (
                    <Badge tone="success">
                      {dict.settings.integrations.connected}
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      {dict.settings.integrations.connect}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
