// 구성명세서 6.5 채점 — 준비도 판정표, 사이트 위생 점수, 이슈 지문

export const SCORE_WEIGHTS = { dup: 30, title: 20, stale: 20, conflict: 15, broken: 10, url: 5 } as const;
export const SCORE_CAPS = { dup: 0.3, title: 0.3, stale: 0.3, conflict: 0.05, broken: 0.1, url: 0.5 } as const;
export type ScoreKey = keyof typeof SCORE_WEIGHTS;

export const SCORE_LABELS: Record<ScoreKey, string> = {
  dup: "중복",
  title: "title 오류",
  stale: "낡음",
  conflict: "사실 충돌",
  broken: "죽은 링크",
  url: "URL 위생",
};

export interface RateInput {
  docCount: number;
  problemDocs: Record<ScoreKey, number>;
}

/** score = 100 − Σ weight_i × min(1, rate_i ÷ cap_i) */
export function siteScore(
  input: RateInput,
  weights: Record<ScoreKey, number> = SCORE_WEIGHTS,
  caps: Record<ScoreKey, number> = SCORE_CAPS,
): { score: number; parts: Record<ScoreKey, { rate: number; penalty: number }> } {
  const parts = {} as Record<ScoreKey, { rate: number; penalty: number }>;
  let penalty = 0;
  for (const k of Object.keys(weights) as ScoreKey[]) {
    const rate = input.docCount > 0 ? input.problemDocs[k] / input.docCount : 0;
    const p = weights[k] * Math.min(1, rate / caps[k]);
    parts[k] = { rate, penalty: p };
    penalty += p;
  }
  return { score: Math.max(0, Math.round((100 - penalty) * 10) / 10), parts };
}

export interface ReadinessInput {
  isNonCanonical: boolean;
  pageType: string;
  hasUnresolvedPii: boolean;
  approvedArchiveOrExclude: boolean;
  boardOutOfWindow: boolean;
  openD2High: boolean;
  inD7High: boolean;
  d6AttachmentOnly: boolean;
  d3PendingReview: boolean;
  d4PairConflict: boolean;
}

export function readiness(i: ReadinessInput): {
  value: "ready" | "fix_first" | "exclude";
  reasons: string[];
} {
  const ex: string[] = [];
  if (i.isNonCanonical) ex.push("NON_CANONICAL");
  if (["board_list", "nav", "citizen_post", "error"].includes(i.pageType))
    ex.push("PAGE_TYPE_" + i.pageType.toUpperCase());
  if (i.hasUnresolvedPii) ex.push("PII");
  if (i.approvedArchiveOrExclude) ex.push("APPROVED_EXCLUDE");
  if (i.boardOutOfWindow) ex.push("BOARD_OUT_OF_WINDOW");
  if (ex.length) return { value: "exclude", reasons: ex };
  const fx: string[] = [];
  if (i.openD2High) fx.push("D2_HIGH_OPEN");
  if (i.inD7High) fx.push("D7_HIGH_OPEN");
  if (i.d6AttachmentOnly) fx.push("D6_ATTACHMENT_ONLY");
  if (i.d3PendingReview) fx.push("D3_REVIEW_PENDING");
  if (i.d4PairConflict) fx.push("D4_PAIR_CONFLICT");
  if (fx.length) return { value: "fix_first", reasons: fx };
  return { value: "ready", reasons: [] };
}

/** 이슈 지문: 같은 문제면 실행마다 같은 값 (sha1 대신 동기 64비트 해시 — 화면용) */
export function fingerprint(code: string, canonicalUrl: string, key: string): string {
  const s = `${code}|${canonicalUrl}|${key}`;
  let h1 = 0xdeadbeef ^ 7,
    h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}
