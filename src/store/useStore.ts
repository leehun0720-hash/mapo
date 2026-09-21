"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Action, Disposition, Issue, IssueStatus, Rules } from "@/lib/types";
import { ISSUES } from "@/data/issues";
import { CLUSTERS } from "@/data/docs";
import { DEFAULT_RULES } from "@/data/rules";

// Vercel(서버리스)에는 DB가 없으므로 승인·규칙 상태는 브라우저 localStorage에 둔다.
// 파일럿 단계에서는 API(POST /issues/{id}/decision)로 대체한다 (구성명세서 9장).

export interface Decision {
  status: IssueStatus;
  disposition: Disposition | null;
  note: string;
  decidedBy: string;
  decidedAt: string;
  newTitle?: string;
}

interface State {
  reviewer: string;
  decisions: Record<number, Decision>;
  actions: Action[];
  rules: Rules;
  rulesHistory: { at: string; by: string; field: keyof Rules; summary: string }[];
  canonicalOverrides: Record<number, { docId: number; by: string; at: string }>;
  vendorToken: string | null;
  setReviewer: (name: string) => void;
  decide: (
    issueId: number,
    decision: "approve" | "reject" | "defer",
    disposition: Disposition | null,
    note: string,
    newTitle?: string,
  ) => void;
  bulkDecide: (issueIds: number[], decision: "approve" | "reject" | "defer", note: string) => void;
  reopen: (issueId: number) => void;
  setRules: (field: keyof Rules, value: Rules[keyof Rules], summary: string) => void;
  resetRules: () => void;
  setCanonical: (clusterId: number, docId: number) => void;
  issueVendorToken: () => string;
  resetAll: () => void;
}

const STATUS_OF = { approve: "approved", reject: "rejected", defer: "deferred" } as const;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      reviewer: "디지털정책팀 담당자",
      decisions: {},
      actions: [],
      rules: DEFAULT_RULES,
      rulesHistory: [],
      canonicalOverrides: {},
      vendorToken: null,
      setReviewer: (name) => set({ reviewer: name }),
      decide: (issueId, decision, disposition, note, newTitle) => {
        const now = new Date().toISOString();
        const by = get().reviewer;
        const action: Action = {
          actionId: Date.now() + Math.floor(Math.random() * 1000),
          issueId,
          decision,
          disposition,
          note,
          decidedBy: by,
          decidedAt: now,
        };
        set((s) => ({
          decisions: {
            ...s.decisions,
            [issueId]: { status: STATUS_OF[decision], disposition, note, decidedBy: by, decidedAt: now, newTitle },
          },
          actions: [action, ...s.actions],
        }));
      },
      bulkDecide: (issueIds, decision, note) => {
        for (const id of issueIds) {
          const base = ISSUES.find((i) => i.issueId === id);
          get().decide(id, decision, decision === "approve" ? (base?.suggestion?.disposition ?? null) : null, note);
        }
      },
      reopen: (issueId) =>
        set((s) => {
          const d = { ...s.decisions };
          delete d[issueId];
          return { decisions: d };
        }),
      setRules: (field, value, summary) =>
        set((s) => ({
          rules: { ...s.rules, [field]: value },
          rulesHistory: [{ at: new Date().toISOString(), by: s.reviewer, field, summary }, ...s.rulesHistory].slice(0, 200),
        })),
      resetRules: () => set({ rules: DEFAULT_RULES }),
      setCanonical: (clusterId, docId) =>
        set((s) => ({
          canonicalOverrides: {
            ...s.canonicalOverrides,
            [clusterId]: { docId, by: s.reviewer, at: new Date().toISOString() },
          },
        })),
      issueVendorToken: () => {
        const t = "vnd_" + Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
        set({ vendorToken: t });
        return t;
      },
      resetAll: () => set({ decisions: {}, actions: [], rules: DEFAULT_RULES, rulesHistory: [], canonicalOverrides: {}, vendorToken: null }),
    }),
    { name: "mapo-hygiene-v1" },
  ),
);

/** 기본 데이터 + 로컬 승인 상태를 합친 이슈 목록 */
export function applyDecisions(decisions: Record<number, Decision>): Issue[] {
  return ISSUES.map((i) => {
    const d = decisions[i.issueId];
    if (!d) return i;
    const suggestion = d.newTitle && i.suggestion ? { ...i.suggestion, newTitle: d.newTitle } : i.suggestion;
    return { ...i, status: d.status, suggestion };
  });
}

export function useIssues(): Issue[] {
  const decisions = useStore((s) => s.decisions);
  return applyDecisions(decisions);
}

export function effectiveCanonical(clusterId: number, overrides: State["canonicalOverrides"]): number {
  const c = CLUSTERS.find((x) => x.clusterId === clusterId);
  return overrides[clusterId]?.docId ?? c?.canonicalDocId ?? 0;
}
