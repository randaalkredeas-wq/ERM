"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

import { useIsClient } from "@/hooks/useIsClient";
import { apiClient } from "@/lib/api-client";
import type {
  RiskFormInput,
  RiskItem,
  RiskWorkflowStatus,
  TreatmentAction,
} from "@/types";

const EMPTY_RISKS: RiskItem[] = [];

/**
 * Plain module-level store (not React state) so risk-register data survives
 * route transitions. The animated PageTransition wrapper in the shell layout
 * keys its subtree by pathname, which remounts every nested layout on
 * navigation — a React-state-based store here would silently reset on every
 * navigation into or out of /risk-register/[id].
 *
 * Backed by the real API: `risks` is a client-side cache populated on first
 * use and kept in sync by replacing/removing entries as mutations resolve.
 */
let risks: RiskItem[] = [];
let loadStatus: "idle" | "loading" | "ready" | "error" = "idle";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return risks;
}

function getStatusSnapshot() {
  return loadStatus;
}

function replaceRisk(updated: RiskItem) {
  risks = risks.map((r) => (r.id === updated.id ? updated : r));
  emit();
}

async function ensureLoaded() {
  if (loadStatus === "loading" || loadStatus === "ready") return;
  loadStatus = "loading";
  try {
    const res = await apiClient.get<{ data: RiskItem[] }>(
      "/api/risks?pageSize=200",
    );
    risks = res.data;
    loadStatus = "ready";
  } catch {
    loadStatus = "error";
  }
  // Marking this a transition keeps a same-tick-resolving fetch (e.g. on a
  // warm local dev server) from racing React's hydration commit and being
  // reported as a hydration mismatch.
  startTransition(() => emit());
}

async function createRisk(input: RiskFormInput): Promise<RiskItem> {
  const res = await apiClient.post<{ data: RiskItem }>("/api/risks", input);
  risks = [res.data, ...risks];
  emit();
  return res.data;
}

async function updateRisk(id: string, input: RiskFormInput): Promise<RiskItem> {
  const res = await apiClient.patch<{ data: RiskItem }>(
    `/api/risks/${id}`,
    input,
  );
  replaceRisk(res.data);
  return res.data;
}

async function deleteRisk(id: string): Promise<void> {
  await apiClient.delete(`/api/risks/${id}`);
  risks = risks.filter((r) => r.id !== id);
  emit();
}

async function duplicateRisk(id: string): Promise<RiskItem> {
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/duplicate`,
  );
  risks = [res.data, ...risks];
  emit();
  return res.data;
}

async function setArchived(id: string, archived: boolean): Promise<RiskItem> {
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/archive`,
    { archived },
  );
  replaceRisk(res.data);
  return res.data;
}

async function addComment(id: string, message: string): Promise<RiskItem | undefined> {
  if (!message.trim()) return undefined;
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/comments`,
    { message },
  );
  replaceRisk(res.data);
  return res.data;
}

async function addAttachment(id: string, file: File): Promise<RiskItem> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/attachments`,
    formData,
  );
  replaceRisk(res.data);
  return res.data;
}

async function removeAttachment(id: string, attachmentId: string): Promise<RiskItem> {
  const res = await apiClient.delete<{ data: RiskItem }>(
    `/api/risks/${id}/attachments/${attachmentId}`,
  );
  replaceRisk(res.data);
  return res.data;
}

async function transitionWorkflow(
  id: string,
  toStatus: RiskWorkflowStatus,
  comment?: string,
): Promise<RiskItem> {
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/workflow`,
    { toStatus, comment },
  );
  replaceRisk(res.data);
  return res.data;
}

const submitForReview = (id: string, comment?: string) =>
  transitionWorkflow(id, "under-review", comment);
const approveRisk = (id: string, comment?: string) =>
  transitionWorkflow(id, "approved", comment);
const rejectRisk = (id: string, comment?: string) =>
  transitionWorkflow(id, "rejected", comment);
const closeRisk = (id: string, comment?: string) =>
  transitionWorkflow(id, "closed", comment);
const reopenRisk = (id: string, comment?: string) =>
  transitionWorkflow(id, "draft", comment);

async function addTreatmentAction(
  id: string,
  input: Omit<TreatmentAction, "id">,
): Promise<RiskItem> {
  const res = await apiClient.post<{ data: RiskItem }>(
    `/api/risks/${id}/treatment-actions`,
    input,
  );
  replaceRisk(res.data);
  return res.data;
}

async function updateTreatmentAction(
  id: string,
  actionId: string,
  patch: Partial<Omit<TreatmentAction, "id">>,
): Promise<RiskItem> {
  const res = await apiClient.patch<{ data: RiskItem }>(
    `/api/risks/${id}/treatment-actions/${actionId}`,
    patch,
  );
  replaceRisk(res.data);
  return res.data;
}

async function deleteTreatmentAction(id: string, actionId: string): Promise<RiskItem> {
  const res = await apiClient.delete<{ data: RiskItem }>(
    `/api/risks/${id}/treatment-actions/${actionId}`,
  );
  replaceRisk(res.data);
  return res.data;
}

async function importRisks(inputs: RiskFormInput[]): Promise<number> {
  for (const input of inputs) {
    await createRisk(input);
  }
  return inputs.length;
}

export function useRiskRegister() {
  const isClient = useIsClient();
  const liveRisks = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const status = useSyncExternalStore(
    subscribe,
    getStatusSnapshot,
    getStatusSnapshot,
  );
  const risks = isClient ? liveRisks : EMPTY_RISKS;

  useEffect(() => {
    void ensureLoaded();
  }, []);

  const getRisk = useCallback(
    (id: string) => risks.find((r) => r.id === id),
    [risks],
  );

  return {
    risks,
    loading: !isClient || status === "idle" || status === "loading",
    getRisk,
    createRisk,
    updateRisk,
    deleteRisk,
    duplicateRisk,
    archiveRisk: (id: string) => setArchived(id, true),
    unarchiveRisk: (id: string) => setArchived(id, false),
    addComment,
    addAttachment,
    removeAttachment,
    submitForReview,
    approveRisk,
    rejectRisk,
    closeRisk,
    reopenRisk,
    addTreatmentAction,
    updateTreatmentAction,
    deleteTreatmentAction,
    importRisks,
  };
}
