"use client";

import { useSyncExternalStore } from "react";

/**
 * Generic module-level CRUD store for interactive mock-data modules.
 * Not React state, so data survives route transitions the same way the
 * risk register store does - see the note in risk-register-context.tsx.
 */
export function createListStore<T extends { id: string }>(seed: T[]) {
  let items: T[] = seed;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function getSnapshot() {
    return items;
  }

  function addItem(item: T) {
    items = [item, ...items];
    emit();
  }

  function updateItem(id: string, patch: Partial<T>) {
    items = items.map((item) => (item.id === id ? { ...item, ...patch } : item));
    emit();
  }

  function replaceItem(id: string, next: T) {
    items = items.map((item) => (item.id === id ? next : item));
    emit();
  }

  function removeItem(id: string) {
    items = items.filter((item) => item.id !== id);
    emit();
  }

  function useItems() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  }

  function useItem(id: string | undefined) {
    const all = useItems();
    return all.find((item) => item.id === id);
  }

  return {
    useItems,
    useItem,
    addItem,
    updateItem,
    replaceItem,
    removeItem,
    getSnapshot,
  };
}
