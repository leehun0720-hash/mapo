"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Action, Disposition, Issue, IssueStatus, Rules } from "@/lib/types";
import { ISSUES } from "@/data/issues";
import { CLUSTERS, docById } from "@/data/docs";
import { DEFAULT_RULES } from "@/data/rules";
import { DEFAULT_ASSUMPTIONS, DEFAULT_MONTH_PLAN, DEFAULT_ROLES, type Assumptions, type CostRole, type MonthPlan } from "@/lib/quote";
import type { RiskStatus, WbsStatus } from "@/data/business";

// Vercel(서버리스)에는 DB가 없으므로 승인·규칙·사업 워크북 상태는 브라우저 localStorage에 둔다.
// 파일럿 단계에서는 API(POST /issues/{id}/decision 등)로 대체한다 (구성명세서 9장).

export interface Decision {
  status: IssueStatus;
  disposition: Disposition | null;
  note: string;
  decidedBy: string;
  decidedAt: string;
  newTitle?: string;
  /** 승인 시점의 원문 버전 (REQ07: 승인 후 원문 변경 시 적용 거부) */
  baseVersion?: number;
}

/** 수정안(제안 편집) — 작성자와 승인자를 분리한다 (REQ06: 자기 승인 금지) */
export interface ProposalEdit {
  disposition: Disposition | null;
  newTitle?: string;
  author: string;
  editedAt: string;
}

interface State {
  reviewer: string;
  decisions: Record<number, Decision>;
  proposalEdits: Record<number, ProposalEdit>;
  actions: Action[];
  rules: Rules;
  rulesHistory: { at: string; by: string; field: keyof Rules; summary: string }[];
  canonicalOverrides: Record<number, { docId: number; by: string; at: string }>;
  vendorToken: string | null;
  // 사업 워크북(견적 xlsx) 상태
  assumptions: Assumptions;
  roles: CostRole[];
  monthPlan: MonthPlan[];
  wbsStatus: Record<string, WbsStatus>;
  riskStatus: Record<string, RiskStatus>;
  gateChecked: Record<string, boolean>;
  interviewAnswers: Record<string, string>;
  pilotConditions: Record<number, boolean>;

  setReviewer: (name: string) => void;
  /** 승인/반려/보류. 자기 승인이면 오류 문자열을 돌려주고 기록하지 않는다 */
  decide: (
    issueId: number,
    decision: "approve" | "reject" | "defer",
    disposition: Disposition | null,
    note: string,
    newTitle?: string,
  ) => string | null;
  bulkDecide: (issueIds: number[], decision: "approve" | "reject" | "defer", note: string) => { done: number; blocked: number };
  reopen: (issueId: number) => void;
  saveProposalEdit: (issueId: number, edit: { disposition: Disposition | null; newTitle?: string }) => void;
  setRules: (field: keyof Rules, value: Rules[keyof Rules], summary: string) => void;
  resetRules: () => void;
  setCanonical: (clusterId: number, docId: number) => void;
  issueVendorToken: () => string;
  setAssumptions: (a: Partial<Assumptions>) => void;
  setRoles: (roles: CostRole[]) => void;
  setMonthPlan: (plan: MonthPlan[]) => void;
  resetWorkbook: () => void;
  setWbsStatus: (id: string, s: WbsStatus) => void;
  setRiskStatus: (id: string, s: RiskStatus) => void;
  toggleGate: (id: string) => void;
  setInterviewAnswer: (id: string, text: string) => void;
  togglePilotCondition: (i: number) => void;
  resetAll: () => void;
}

const STATUS_OF = { approve: "approved", reject: "rejected", defer: "deferred" } as const;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      reviewer: "스마트정책과 디지털정책팀",
      decisions: {},
      proposalEdits: {},
      actions: [],
      rules: DEFAULT_RULES,
      rulesHistory: [],
      canonicalOverrides: {},
      vendorToken: null,
      assumptions: DEFAULT_ASSUMPTIONS,
      roles: DEFAULT_ROLES,
      monthPlan: DEFAULT_MONTH_PLAN,
      wbsStatus: {},
      riskStatus: {},
      gateChecked: {},
      interviewAnswers: {},
      pilotConditions: {},

      setReviewer: (name) => set({ reviewer: name }),
      decide: (issueId, decision, disposition, note, newTitle) => {
        const by = get().reviewer;
        const edit = get().proposalEdits[issueId];
        if (decision === "approve" && edit && edit.author.trim() === by.trim()) {
          return `자기 승인 금지: 이 수정안은 ${edit.author}가 작성했습니다. 다른 검토자(소관 부서)로 전환한 뒤 승인하세요.`;
        }
        const now = new Date().toISOString();
        const base = ISSUES.find((i) => i.issueId === issueId);
        const doc = docById(base?.docId);
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
            [issueId]: {
              status: STATUS_OF[decision],
              disposition,
              note,
              decidedBy: by,
              decidedAt: now,
              newTitle: newTitle ?? edit?.newTitle,
              baseVersion: doc?.version,
            },
          },
          actions: [action, ...s.actions],
        }));
        return null;
      },
      bulkDecide: (issueIds, decision, note) => {
        const label = { approve: "묶음 승인", reject: "묶음 반려", defer: "묶음 보류" }[decision];
        let done = 0;
        let blocked = 0;
        for (const id of issueIds) {
          const base = ISSUES.find((i) => i.issueId === id);
          const edit = get().proposalEdits[id];
          const disp = decision === "approve" ? ((edit?.disposition ?? base?.suggestion?.disposition) ?? null) : null;
          const err = get().decide(id, decision, disp, note || label);
          if (err) blocked++;
          else done++;
        }
        return { done, blocked };
      },
      reopen: (issueId) =>
        set((s) => {
          const d = { ...s.decisions };
          delete d[issueId];
          return { decisions: d };
        }),
      saveProposalEdit: (issueId, edit) =>
        set((s) => ({
          proposalEdits: { ...s.proposalEdits, [issueId]: { ...edit, author: s.reviewer, editedAt: new Date().toISOString() } },
        })),
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
      setAssumptions: (a) => set((s) => ({ assumptions: { ...s.assumptions, ...a } })),
      setRoles: (roles) => set({ roles }),
      setMonthPlan: (plan) => set({ monthPlan: plan }),
      resetWorkbook: () => set({ assumptions: DEFAULT_ASSUMPTIONS, roles: DEFAULT_ROLES, monthPlan: DEFAULT_MONTH_PLAN }),
      setWbsStatus: (id, st) => set((s) => ({ wbsStatus: { ...s.wbsStatus, [id]: st } })),
      setRiskStatus: (id, st) => set((s) => ({ riskStatus: { ...s.riskStatus, [id]: st } })),
      toggleGate: (id) => set((s) => ({ gateChecked: { ...s.gateChecked, [id]: !s.gateChecked[id] } })),
      setInterviewAnswer: (id, text) => set((s) => ({ interviewAnswers: { ...s.interviewAnswers, [id]: text } })),
      togglePilotCondition: (i) => set((s) => ({ pilotConditions: { ...s.pilotConditions, [i]: !s.pilotConditions[i] } })),
      resetAll: () =>
        set({
          decisions: {},
          proposalEdits: {},
          actions: [],
          rules: DEFAULT_RULES,
          rulesHistory: [],
          canonicalOverrides: {},
          vendorToken: null,
          assumptions: DEFAULT_ASSUMPTIONS,
          roles: DEFAULT_ROLES,
          monthPlan: DEFAULT_MONTH_PLAN,
          wbsStatus: {},
          riskStatus: {},
          gateChecked: {},
          interviewAnswers: {},
          pilotConditions: {},
        }),
    }),
    {
      name: "mapo-hygiene-v1",
      // 이전 버전 저장소에 없는 필드는 기본값으로 채운다
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<State>;
        return {
          ...current,
          ...p,
          rules: { ...current.rules, ...(p.rules ?? {}) },
          assumptions: { ...current.assumptions, ...(p.assumptions ?? {}) },
          roles: p.roles?.length ? p.roles : current.roles,
          monthPlan: p.monthPlan?.length === 12 ? p.monthPlan : current.monthPlan,
        };
      },
    },
  ),
);

/** 기본 데이터 + 로컬 승인·수정안 상태를 합친 이슈 목록 */
export function applyDecisions(decisions: Record<number, Decision>, edits: Record<number, ProposalEdit> = {}): Issue[] {
  return ISSUES.map((i) => {
    const d = decisions[i.issueId];
    const e = edits[i.issueId];
    let suggestion = i.suggestion;
    if (e) suggestion = { ...(suggestion ?? {}), disposition: e.disposition ?? suggestion?.disposition, newTitle: e.newTitle ?? suggestion?.newTitle };
    if (!d) return e ? { ...i, suggestion } : i;
    if (d.newTitle && suggestion) suggestion = { ...suggestion, newTitle: d.newTitle };
    if (d.disposition && suggestion) suggestion = { ...suggestion, disposition: d.disposition };
    return { ...i, status: d.status, suggestion, approvedBaseVersion: d.status === "approved" ? d.baseVersion : i.approvedBaseVersion };
  });
}

export function useIssues(): Issue[] {
  const decisions = useStore((s) => s.decisions);
  const edits = useStore((s) => s.proposalEdits);
  return applyDecisions(decisions, edits);
}

export function effectiveCanonical(clusterId: number, overrides: State["canonicalOverrides"]): number {
  const c = CLUSTERS.find((x) => x.clusterId === clusterId);
  return overrides[clusterId]?.docId ?? c?.canonicalDocId ?? 0;
}
