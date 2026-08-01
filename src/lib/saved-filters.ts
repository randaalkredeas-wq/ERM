"use client";

import { useStoredValue } from "@/hooks/useStoredValue";
import type { RiskFilterState } from "@/components/risk-register/RiskFiltersPanel";

const STORAGE_KEY = "erm-risk-register-saved-filters";

export interface SavedRiskFilter {
  id: string;
  name: string;
  filters: RiskFilterState;
}

export function useSavedRiskFilters() {
  const [raw, setRaw] = useStoredValue(STORAGE_KEY, "[]");

  let saved: SavedRiskFilter[] = [];
  try {
    saved = JSON.parse(raw);
  } catch {
    saved = [];
  }

  function save(name: string, filters: RiskFilterState) {
    const next: SavedRiskFilter[] = [
      ...saved,
      { id: `FLT-${Date.now()}`, name, filters },
    ];
    setRaw(JSON.stringify(next));
  }

  function remove(id: string) {
    setRaw(JSON.stringify(saved.filter((f) => f.id !== id)));
  }

  return { saved, save, remove };
}
