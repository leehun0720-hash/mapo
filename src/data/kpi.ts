import type { KpiPoint, Run } from "@/lib/types";

export const RUNS: Run[] = [
  {
    runId: 15,
    kind: "full",
    startedAt: "2026-09-07T22:00:00+09:00",
    finishedAt: "2026-09-09T05:40:00+09:00",
    stats: {
      urls: 61240,
      docs: 10330,
      errorRate: 0.011,
      llmCostKrw: 48200,
      durationMin: 1900,
      coverage: { agreed: 10680, checked: 10330, failed: { access: 142, extract: 118, unsupported: 90 } },
    },
  },
  {
    runId: 16,
    kind: "incremental",
    startedAt: "2026-09-14T22:00:00+09:00",
    finishedAt: "2026-09-15T00:12:00+09:00",
    stats: { urls: 4120, docs: 388, errorRate: 0.004, llmCostKrw: 2100, durationMin: 132 },
  },
  {
    runId: 17,
    kind: "incremental",
    startedAt: "2026-09-21T22:00:00+09:00",
    finishedAt: "2026-09-22T00:05:00+09:00",
    stats: {
      urls: 3980,
      docs: 362,
      errorRate: 0.006,
      llmCostKrw: 1900,
      durationMin: 125,
      coverage: { agreed: 380, checked: 362, failed: { access: 7, extract: 6, unsupported: 5 } },
    },
  },
];

export const CURRENT_RUN = 17;

// KPI ⑦ 콘텐츠 신선도 주간 추이 (시연용)
export const KPI_SERIES: KpiPoint[] = [
  { date: "2026-08-03", dupRate: 0.312, titleErrors: 1840, stale90d: 3120, expired: 215, factConflicts: 41, brokenLinks: 388, includeRatio: 0.41, structuredRatio: 0.12 },
  { date: "2026-08-10", dupRate: 0.31, titleErrors: 1832, stale90d: 3105, expired: 214, factConflicts: 41, brokenLinks: 371, includeRatio: 0.42, structuredRatio: 0.12 },
  { date: "2026-08-17", dupRate: 0.298, titleErrors: 1790, stale90d: 3088, expired: 209, factConflicts: 39, brokenLinks: 352, includeRatio: 0.44, structuredRatio: 0.13 },
  { date: "2026-08-24", dupRate: 0.281, titleErrors: 1512, stale90d: 3010, expired: 198, factConflicts: 38, brokenLinks: 340, includeRatio: 0.47, structuredRatio: 0.15 },
  { date: "2026-08-31", dupRate: 0.264, titleErrors: 1220, stale90d: 2950, expired: 190, factConflicts: 35, brokenLinks: 301, includeRatio: 0.5, structuredRatio: 0.17 },
  { date: "2026-09-07", dupRate: 0.241, titleErrors: 1204, stale90d: 2890, expired: 181, factConflicts: 33, brokenLinks: 288, includeRatio: 0.53, structuredRatio: 0.19 },
  { date: "2026-09-14", dupRate: 0.22, titleErrors: 980, stale90d: 2801, expired: 176, factConflicts: 29, brokenLinks: 262, includeRatio: 0.56, structuredRatio: 0.22 },
  { date: "2026-09-21", dupRate: 0.208, titleErrors: 951, stale90d: 2744, expired: 171, factConflicts: 27, brokenLinks: 249, includeRatio: 0.58, structuredRatio: 0.24 },
];

// 사이트별 문제 문서 수 (채점용, 시연용 표본)
export const SITE_PROBLEM_DOCS: Record<number, { dup: number; title: number; stale: number; conflict: number; broken: number; url: number }> = {
  1: { dup: 610, title: 420, stale: 1380, conflict: 22, broken: 96, url: 1450 },
  2: { dup: 260, title: 590, stale: 140, conflict: 2, broken: 21, url: 88 },
  3: { dup: 150, title: 90, stale: 120, conflict: 3, broken: 14, url: 40 },
  4: { dup: 300, title: 210, stale: 480, conflict: 0, broken: 70, url: 210 },
  5: { dup: 210, title: 160, stale: 200, conflict: 0, broken: 38, url: 95 },
  6: { dup: 4, title: 152, stale: 60, conflict: 0, broken: 9, url: 11 },
  7: { dup: 3, title: 150, stale: 58, conflict: 0, broken: 8, url: 10 },
  8: { dup: 620, title: 0, stale: 0, conflict: 0, broken: 12, url: 2380 },
  9: { dup: 0, title: 0, stale: 0, conflict: 0, broken: 3, url: 0 },
};
