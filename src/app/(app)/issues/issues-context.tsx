"use client";

import { createListStore } from "@/lib/create-list-store";
import { CURRENT_USER } from "@/lib/domain";
import { issueItems } from "@/lib/mock-data/issues";
import type { IssueItem, IssuePriority, IssueSource } from "@/types";

const store = createListStore<IssueItem>(issueItems);

function nextId(existing: IssueItem[]) {
  const max = existing.reduce((acc, i) => {
    const num = Number(i.id.replace("ISS-", ""));
    return Number.isFinite(num) ? Math.max(acc, num) : acc;
  }, 4000);
  return `ISS-${max + 1}`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export interface IssueInput {
  title: string;
  description: string;
  source: IssueSource;
  relatedRiskId: string | null;
  relatedIncidentId: string | null;
  priority: IssuePriority;
  owner: string;
  dueDate: string;
}

function createIssue(input: IssueInput): IssueItem {
  const issue: IssueItem = {
    id: nextId(store.getSnapshot()),
    ...input,
    status: "open",
    escalated: false,
    escalatedTo: null,
    escalatedAt: null,
    comments: [],
    closureEvidence: null,
    createdAt: today(),
    updatedAt: today(),
  };
  store.addItem(issue);
  return issue;
}

function addComment(id: string, message: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || !message.trim()) return;
  store.updateItem(id, {
    comments: [
      ...current.comments,
      {
        id: `${id}-C${current.comments.length + 1}`,
        author: CURRENT_USER.name,
        message: message.trim(),
        createdAt: today(),
      },
    ],
    updatedAt: today(),
  });
}

function escalate(id: string, escalatedTo: string) {
  store.updateItem(id, {
    status: "escalated",
    escalated: true,
    escalatedTo,
    escalatedAt: today(),
    updatedAt: today(),
  });
}

function startProgress(id: string) {
  const current = store.getSnapshot().find((i) => i.id === id);
  if (!current || current.status !== "open") return;
  store.updateItem(id, { status: "in-progress", updatedAt: today() });
}

function resolve(id: string) {
  store.updateItem(id, { status: "resolved", updatedAt: today() });
}

function close(id: string, closureEvidence: string) {
  if (!closureEvidence.trim()) return;
  store.updateItem(id, {
    status: "closed",
    closureEvidence: closureEvidence.trim(),
    updatedAt: today(),
  });
}

export function useIssues() {
  const issues = store.useItems();
  return {
    issues,
    getIssue: (id: string) => issues.find((i) => i.id === id),
    createIssue,
    addComment,
    escalate,
    startProgress,
    resolve,
    close,
    removeIssue: (id: string) => store.removeItem(id),
  };
}
