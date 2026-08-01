"use client";

import {
  AlertOctagon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileDown,
  FileSpreadsheet,
  PieChart,
  Printer,
  Search,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { ChartCard, ChartLegendItem } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { TrendAreaChart } from "@/components/charts/TrendAreaChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatCard } from "@/components/ui/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  COLLECTION_STATUSES,
  ECL_STAGES,
  PORTFOLIO_PRODUCTS,
  PORTFOLIO_SECTORS,
  PORTFOLIO_SEGMENTS,
} from "@/constants/portfolio";
import { apiClient } from "@/lib/api-client";
import { collectionStatusTone, eclStageTone } from "@/lib/domain";
import {
  nplTrendMonthly,
  nplTrendQuarterly,
  nplTrendYearly,
} from "@/lib/mock-data/portfolio";
import {
  exportPortfolioToExcel,
  exportPortfolioToPdf,
} from "@/lib/portfolio-export";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { useLocale } from "@/providers/locale-provider";
import type {
  AgingBucket,
  CreditExposure,
  EclStage,
} from "@/types";

const PAGE_SIZE = 8;

const stageColors: Record<string, string> = {
  "stage-1": "var(--success)",
  "stage-2": "var(--warning)",
  "stage-3": "var(--danger)",
};

const periods = ["monthly", "quarterly", "yearly"] as const;
type Period = (typeof periods)[number];

interface PortfolioSummary {
  totalPortfolio: number;
  nplAmount: number;
  nplRatio: number;
  eclProvision: number;
  eclCoverageRatio: number;
  collectionRate: number;
  overdueAmount: number;
}

interface EclStageBreakdownRow {
  stage: EclStage;
  exposureAmount: number;
  eclAmount: number;
  count: number;
}

const EMPTY_SUMMARY: PortfolioSummary = {
  totalPortfolio: 0,
  nplAmount: 0,
  nplRatio: 0,
  eclProvision: 0,
  eclCoverageRatio: 0,
  collectionRate: 0,
  overdueAmount: 0,
};

export default function PortfolioPage() {
  const { dict } = useLocale();
  const [period, setPeriod] = useState<Period>("monthly");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("all");
  const [product, setProduct] = useState("all");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pdfExporting, setPdfExporting] = useState(false);

  const [creditExposures, setCreditExposures] = useState<CreditExposure[]>([]);
  const [portfolioSummary, setPortfolioSummary] =
    useState<PortfolioSummary>(EMPTY_SUMMARY);
  const [eclStageBreakdown, setEclStageBreakdown] = useState<
    EclStageBreakdownRow[]
  >([]);
  const [sectorConcentration, setSectorConcentration] = useState<
    { label: string; value: number }[]
  >([]);
  const [agingBuckets, setAgingBuckets] = useState<AgingBucket[]>([]);

  useEffect(() => {
    void apiClient
      .get<{ data: CreditExposure[] }>("/api/portfolio/exposures?pageSize=200")
      .then((res) => setCreditExposures(res.data))
      .catch(() => {});
    void apiClient
      .get<{
        data: {
          summary: PortfolioSummary;
          eclStageBreakdown: EclStageBreakdownRow[];
          sectorConcentration: { label: string; value: number }[];
          agingBuckets: AgingBucket[];
        };
      }>("/api/portfolio/summary")
      .then((res) => {
        setPortfolioSummary(res.data.summary);
        setEclStageBreakdown(res.data.eclStageBreakdown);
        setSectorConcentration(res.data.sectorConcentration);
        setAgingBuckets(res.data.agingBuckets);
      })
      .catch(() => {});
  }, []);

  const trendData =
    period === "monthly"
      ? nplTrendMonthly
      : period === "quarterly"
        ? nplTrendQuarterly
        : nplTrendYearly;

  const eclDonutData = eclStageBreakdown.map((s) => ({
    name: dict.portfolio.enums.eclStage[s.stage],
    value: s.exposureAmount,
    color: stageColors[s.stage],
  }));

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return creditExposures.filter((exposure) => {
      const matchesQuery =
        !q ||
        exposure.customerName.toLowerCase().includes(q) ||
        exposure.id.toLowerCase().includes(q);
      const matchesSegment = segment === "all" || exposure.segment === segment;
      const matchesProduct = product === "all" || exposure.product === product;
      const matchesSector = sector === "all" || exposure.sector === sector;
      const matchesStage = stage === "all" || exposure.eclStage === stage;
      const matchesStatus =
        status === "all" || exposure.collectionStatus === status;
      return (
        matchesQuery &&
        matchesSegment &&
        matchesProduct &&
        matchesSector &&
        matchesStage &&
        matchesStatus
      );
    });
  }, [creditExposures, query, segment, product, sector, stage, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  async function handleExportPdf() {
    setPdfExporting(true);
    try {
      await exportPortfolioToPdf(filtered);
    } finally {
      setPdfExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={dict.portfolio.title}
        subtitle={dict.portfolio.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPortfolioToExcel(filtered)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {dict.portfolio.exportExcel}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pdfExporting}
              onClick={handleExportPdf}
            >
              <FileDown className="h-4 w-4" />
              {dict.portfolio.exportPdf}
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              {dict.portfolio.print}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={dict.portfolio.kpi.totalPortfolio}
          value={formatCurrency(portfolioSummary.totalPortfolio, dict.meta.locale)}
          icon={Wallet}
          tone="primary"
        />
        <StatCard
          label={dict.portfolio.kpi.nplRatio}
          value={`${portfolioSummary.nplRatio.toFixed(1)}%`}
          icon={TrendingDown}
          tone="danger"
        />
        <StatCard
          label={dict.portfolio.kpi.nplAmount}
          value={formatCurrency(portfolioSummary.nplAmount, dict.meta.locale)}
          icon={AlertOctagon}
          tone="danger"
        />
        <StatCard
          label={dict.portfolio.kpi.eclProvision}
          value={formatCurrency(portfolioSummary.eclProvision, dict.meta.locale)}
          icon={ShieldCheck}
          tone="warning"
        />
        <StatCard
          label={dict.portfolio.kpi.eclCoverageRatio}
          value={`${portfolioSummary.eclCoverageRatio.toFixed(1)}%`}
          icon={PieChart}
          tone="info"
        />
        <StatCard
          label={dict.portfolio.kpi.collectionRate}
          value={`${portfolioSummary.collectionRate.toFixed(1)}%`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label={dict.portfolio.kpi.overdueAmount}
          value={formatCurrency(portfolioSummary.overdueAmount, dict.meta.locale)}
          icon={Clock3}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ChartCard
          title={dict.portfolio.nplTrend}
          subtitle={dict.portfolio.nplTrendSubtitle}
          className="lg:col-span-2"
          actions={
            <div className="border-border bg-surface-2 print:hidden inline-flex items-center gap-1 rounded-lg border p-1">
              {periods.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    period === p
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {dict.dashboard.period[p]}
                </button>
              ))}
            </div>
          }
        >
          <TrendAreaChart data={trendData} color="var(--danger)" />
        </ChartCard>
        <ChartCard
          title={dict.portfolio.eclByStage}
          subtitle={dict.portfolio.eclByStageSubtitle}
          legend={eclStageBreakdown.map((s) => (
            <ChartLegendItem
              key={s.stage}
              color={stageColors[s.stage]}
              label={`${dict.portfolio.enums.eclStage[s.stage]} · ${formatCurrency(s.eclAmount, dict.meta.locale)}`}
            />
          ))}
        >
          <DonutChart data={eclDonutData} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title={dict.portfolio.sectorConcentration}
          subtitle={dict.portfolio.sectorConcentrationSubtitle}
        >
          <CategoryBarChart
            data={sectorConcentration}
            horizontal
            height={300}
            color="var(--chart-1)"
          />
        </ChartCard>
        <ChartCard
          title={dict.portfolio.agingAnalysis}
          subtitle={dict.portfolio.agingAnalysisSubtitle}
        >
          <CategoryBarChart
            data={agingBuckets.map((b) => ({ label: b.label, value: b.amount }))}
            height={300}
            color="var(--chart-2)"
          />
        </ChartCard>
      </div>

      <Card className="print:hidden grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="text-muted absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={dict.portfolio.searchPlaceholder}
            className="ps-9"
          />
        </div>
        <Select
          value={segment}
          onChange={(e) => {
            setSegment(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">{dict.portfolio.allSegments}</option>
          {PORTFOLIO_SEGMENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={product}
          onChange={(e) => {
            setProduct(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">{dict.portfolio.allProducts}</option>
          {PORTFOLIO_PRODUCTS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">{dict.portfolio.allSectors}</option>
          {PORTFOLIO_SECTORS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={stage}
          onChange={(e) => {
            setStage(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">{dict.portfolio.allStages}</option>
          {ECL_STAGES.map((s) => (
            <option key={s} value={s}>
              {dict.portfolio.enums.eclStage[s]}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">{dict.portfolio.allStatuses}</option>
          {COLLECTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {dict.portfolio.enums.collectionStatus[s]}
            </option>
          ))}
        </Select>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{dict.portfolio.columns.id}</TableHead>
              <TableHead>{dict.portfolio.columns.customer}</TableHead>
              <TableHead>{dict.portfolio.columns.segment}</TableHead>
              <TableHead>{dict.portfolio.columns.sector}</TableHead>
              <TableHead>{dict.portfolio.columns.product}</TableHead>
              <TableHead>{dict.portfolio.columns.outstanding}</TableHead>
              <TableHead>{dict.portfolio.columns.dpd}</TableHead>
              <TableHead>{dict.portfolio.columns.eclStage}</TableHead>
              <TableHead>{dict.portfolio.columns.eclAmount}</TableHead>
              <TableHead>{dict.portfolio.columns.riskRating}</TableHead>
              <TableHead>{dict.portfolio.columns.collectionStatus}</TableHead>
              <TableHead>{dict.portfolio.columns.nextAction}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((exposure) => (
              <TableRow key={exposure.id}>
                <TableCell className="text-muted font-mono text-xs">
                  {exposure.id}
                </TableCell>
                <TableCell className="text-foreground max-w-48 truncate font-medium">
                  {exposure.customerName}
                </TableCell>
                <TableCell className="text-muted">{exposure.segment}</TableCell>
                <TableCell className="text-muted">{exposure.sector}</TableCell>
                <TableCell className="text-muted">{exposure.product}</TableCell>
                <TableCell className="text-foreground font-medium" dir="ltr">
                  {formatCurrency(exposure.outstandingBalance, dict.meta.locale)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-muted",
                    exposure.daysPastDue >= 90 && "text-danger font-semibold",
                    exposure.daysPastDue > 0 &&
                      exposure.daysPastDue < 90 &&
                      "text-warning font-medium",
                  )}
                >
                  {exposure.daysPastDue}
                </TableCell>
                <TableCell>
                  <Badge tone={eclStageTone[exposure.eclStage]}>
                    {dict.portfolio.enums.eclStage[exposure.eclStage]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted" dir="ltr">
                  {formatCurrency(exposure.eclAmount, dict.meta.locale)}
                </TableCell>
                <TableCell>
                  <Badge tone="neutral">{exposure.riskRating}</Badge>
                </TableCell>
                <TableCell>
                  <Badge tone={collectionStatusTone[exposure.collectionStatus]} dot>
                    {dict.portfolio.enums.collectionStatus[exposure.collectionStatus]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted">
                  {formatDate(exposure.nextActionDate, dict.meta.locale)}
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-muted py-10 text-center">
                  {dict.portfolio.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="text-muted flex items-center justify-between text-sm">
        <p>
          {dict.portfolio.showingResults
            .replace("{count}", String(paged.length))
            .replace("{total}", String(filtered.length))}
        </p>
        <div className="print:hidden flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>
          <span className="min-w-16 text-center" dir="ltr">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </div>
  );
}
