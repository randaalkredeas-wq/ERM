"use client";

import { ArrowLeft, Plus, TestTube } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { BCP_TEST_TYPES } from "@/constants/grc";
import { bcmCriticalityTone, bcpTestResultTone } from "@/lib/grc-domain";
import { formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type { BcpTestResult } from "@/types";

import { useBusinessContinuity } from "../business-continuity-context";

export default function BusinessProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { dict } = useLocale();
  const { getProcess, addTest } = useBusinessContinuity();

  const [testType, setTestType] = useState<string>(BCP_TEST_TYPES[0]);
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [testResult, setTestResult] = useState<BcpTestResult>("passed");
  const [notes, setNotes] = useState("");

  const process = getProcess(id);
  if (!process) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/business-continuity"
        className="text-muted hover:text-foreground print:hidden flex w-fit items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {dict.businessContinuity.backToList}
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted font-mono text-xs">{process.id}</span>
          <Badge tone={bcmCriticalityTone[process.criticality]}>
            {dict.common[process.criticality]}
          </Badge>
        </div>
        <h1 className="text-foreground mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          {process.name}
        </h1>
        <p className="text-muted mt-1.5 text-sm">{process.department}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-3">
          <CardTitle>{dict.rcsa.overview}</CardTitle>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Row label={dict.common.owner} value={process.owner} />
            <Row label={dict.businessContinuity.mtd} value={process.mtd} />
            <Row label={dict.businessContinuity.rto} value={process.rto} />
            <Row label={dict.businessContinuity.rpo} value={process.rpo} />
          </dl>
          <div className="border-border border-t pt-3">
            <p className="text-muted text-xs font-medium">{dict.businessContinuity.recoveryStrategy}</p>
            <p className="text-foreground mt-1 text-sm">{process.recoveryStrategy}</p>
          </div>
        </Card>

        <Card className="space-y-3">
          <CardTitle>{dict.businessContinuity.columns.testResult}</CardTitle>
          <Badge tone={bcpTestResultTone[process.testResult]} dot>
            {dict.businessContinuity.enums.testResult[process.testResult]}
          </Badge>
          <p className="text-muted text-xs">
            {dict.businessContinuity.columns.lastTested}: {formatDate(process.lastTested, dict.meta.locale)}
          </p>
        </Card>
      </div>

      <Card className="space-y-3 p-0">
        <CardTitle className="p-4 pb-0">{dict.businessContinuity.bcpTesting}</CardTitle>
        {process.tests.length === 0 ? (
          <EmptyState icon={TestTube} title={dict.businessContinuity.noTests} />
        ) : (
          <div className="divide-border divide-y">
            {process.tests.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-foreground text-sm font-medium">{t.type}</p>
                  <p className="text-muted text-xs">{formatDate(t.date, dict.meta.locale)}</p>
                  <p className="text-muted mt-1 text-sm">{t.notes}</p>
                </div>
                <Badge tone={bcpTestResultTone[t.result]} dot>
                  {dict.businessContinuity.enums.testResult[t.result]}
                </Badge>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2">
          <Select value={testType} onChange={(e) => setTestType(e.target.value)}>
            {BCP_TEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          <Select value={testResult} onChange={(e) => setTestResult(e.target.value as BcpTestResult)}>
            <option value="passed">{dict.businessContinuity.enums.testResult.passed}</option>
            <option value="passed-with-observations">
              {dict.businessContinuity.enums.testResult["passed-with-observations"]}
            </option>
            <option value="failed">{dict.businessContinuity.enums.testResult.failed}</option>
          </Select>
          <Textarea
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={dict.businessContinuity.testNotesPlaceholder}
          />
          <Button
            size="sm"
            variant="outline"
            className="sm:col-span-2"
            onClick={() => {
              addTest(process.id, { type: testType, date: testDate, result: testResult, notes });
              setNotes("");
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {dict.businessContinuity.recordTest}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-muted shrink-0">{label}</dt>
      <dd className="text-foreground text-end font-medium">{value}</dd>
    </div>
  );
}
