"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import {
  CATEGORY_SUBCATEGORIES,
  DEPARTMENTS,
  RISK_CATEGORIES,
  RISK_OWNERS,
} from "@/constants/risk-register";
import { useLocale } from "@/providers/locale-provider";
import type { RiskStatus, Severity } from "@/types";

export interface RiskFilterState {
  department: string;
  category: string;
  subcategory: string;
  status: RiskStatus | "all";
  inherentRisk: Severity | "all";
  residualRisk: Severity | "all";
  owner: string;
}

export const emptyRiskFilters: RiskFilterState = {
  department: "all",
  category: "all",
  subcategory: "all",
  status: "all",
  inherentRisk: "all",
  residualRisk: "all",
  owner: "all",
};

interface RiskFiltersPanelProps {
  filters: RiskFilterState;
  onChange: (filters: RiskFilterState) => void;
}

const severities: Severity[] = ["low", "medium", "high", "critical"];

export function RiskFiltersPanel({ filters, onChange }: RiskFiltersPanelProps) {
  const { dict } = useLocale();

  const subcategoryOptions = useMemo(() => {
    if (filters.category === "all") {
      return Array.from(new Set(Object.values(CATEGORY_SUBCATEGORIES).flat()));
    }
    return CATEGORY_SUBCATEGORIES[filters.category] ?? [];
  }, [filters.category]);

  function set<K extends keyof RiskFilterState>(
    key: K,
    value: RiskFilterState[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.form.department}
        </label>
        <Select
          value={filters.department}
          onChange={(e) => set("department", e.target.value)}
        >
          <option value="all">{dict.riskRegister.allDepartments}</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.form.category}
        </label>
        <Select
          value={filters.category}
          onChange={(e) => {
            onChange({
              ...filters,
              category: e.target.value,
              subcategory: "all",
            });
          }}
        >
          <option value="all">{dict.riskRegister.allCategories}</option>
          {RISK_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.form.subcategory}
        </label>
        <Select
          value={filters.subcategory}
          onChange={(e) => set("subcategory", e.target.value)}
        >
          <option value="all">{dict.riskRegister.allSubcategories}</option>
          {subcategoryOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.form.owner}
        </label>
        <Select
          value={filters.owner}
          onChange={(e) => set("owner", e.target.value)}
        >
          <option value="all">{dict.riskRegister.allOwners}</option>
          {RISK_OWNERS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.common.status}
        </label>
        <Select
          value={filters.status}
          onChange={(e) =>
            set("status", e.target.value as RiskFilterState["status"])
          }
        >
          <option value="all">{dict.common.all}</option>
          <option value="open">{dict.common.open}</option>
          <option value="mitigating">{dict.common.inProgress}</option>
          <option value="pending-approval">{dict.common.pending}</option>
          <option value="closed">{dict.common.closed}</option>
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.form.inherentRisk}
        </label>
        <Select
          value={filters.inherentRisk}
          onChange={(e) =>
            set(
              "inherentRisk",
              e.target.value as RiskFilterState["inherentRisk"],
            )
          }
        >
          <option value="all">{dict.common.all}</option>
          {severities.map((s) => (
            <option key={s} value={s}>
              {dict.common[s]}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="text-muted mb-1.5 block text-xs font-medium">
          {dict.riskRegister.columns.residualRisk}
        </label>
        <Select
          value={filters.residualRisk}
          onChange={(e) =>
            set(
              "residualRisk",
              e.target.value as RiskFilterState["residualRisk"],
            )
          }
        >
          <option value="all">{dict.common.all}</option>
          {severities.map((s) => (
            <option key={s} value={s}>
              {dict.common[s]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onChange(emptyRiskFilters)}
        >
          {dict.riskRegister.clearFilters}
        </Button>
      </div>
    </Card>
  );
}
