"use client";

import { createListStore } from "@/lib/create-list-store";
import { controlItems } from "@/lib/mock-data/controls-library";
import type { ControlItem } from "@/types";

const store = createListStore<ControlItem>(controlItems);

function nextId(existing: ControlItem[]) {
  const max = existing.reduce((acc, c) => {
    const num = Number(c.id.replace("CTL-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 2000);
  return `CTL-${max + 1}`;
}

export type ControlItemInput = Omit<ControlItem, "id">;

function createControl(input: ControlItemInput): ControlItem {
  const control: ControlItem = { id: nextId(store.getSnapshot()), ...input };
  store.addItem(control);
  return control;
}

function updateControl(id: string, input: ControlItemInput) {
  store.updateItem(id, input);
}

export function useControlsLibrary() {
  const controls = store.useItems();
  return {
    controls,
    getControl: (id: string) => controls.find((c) => c.id === id),
    createControl,
    updateControl,
    removeControl: (id: string) => store.removeItem(id),
  };
}
