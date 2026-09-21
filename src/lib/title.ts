// 구성명세서 6.4 D2 title — 규칙 T1~T4 (T5 의미 판정은 LLM 단계, 여기서는 제외)

export type TitleCode =
  | "D2_T1_MISSING"
  | "D2_T2_SITE_DEFAULT"
  | "D2_T3_MASS_SHARED"
  | "D2_T4_H1_MISMATCH";

const PARTICLES = /(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|까지|부터)$/;

/** 명사 근사 토큰: 공백·기호로 나누고 흔한 조사를 뗀다 (형태소 분석기 없이 쓰는 근사치) */
export function nounTokens(s: string | null | undefined): Set<string> {
  if (!s) return new Set();
  return new Set(
    s
      .replace(/[|\-–>·,.()[\]/:]/g, " ")
      .split(/\s+/)
      .map((t) => t.trim().replace(PARTICLES, ""))
      .filter((t) => t.length >= 2),
  );
}

export function jaccard<T>(a: Set<T>, b: Set<T>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function splitTitle(title: string): string[] {
  return title
    .split(/\s*[|\-–>]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface TitleCheckInput {
  title: string | null;
  h1: string | null;
  breadcrumb: string[];
  isHome: boolean;
  siteDefaultTitle: string | null;
  h1JaccardMax?: number;
}

export interface TitleCheckResult {
  code: TitleCode | null;
  detail: string;
  bestOverlap?: number;
}

export function checkTitle(i: TitleCheckInput): TitleCheckResult {
  const max = i.h1JaccardMax ?? 0.2;
  const t = (i.title ?? "").trim();
  if (!t) return { code: "D2_T1_MISSING", detail: "title이 비어 있음" };
  if (!i.isHome && i.siteDefaultTitle && t === i.siteDefaultTitle.trim())
    return { code: "D2_T2_SITE_DEFAULT", detail: "홈이 아닌데 사이트 기본 title과 동일" };

  const targets = [i.h1, i.breadcrumb[i.breadcrumb.length - 1]].filter(Boolean) as string[];
  if (targets.length === 0) return { code: null, detail: "비교 대상 없음(h1·브레드크럼 부재)" };
  let best = 0;
  for (const piece of splitTitle(t)) {
    const pt = nounTokens(piece);
    for (const tg of targets) best = Math.max(best, jaccard(pt, nounTokens(tg)));
  }
  if (best < max)
    return {
      code: "D2_T4_H1_MISMATCH",
      detail: `title 조각과 h1·브레드크럼의 명사 겹침 최대 ${best.toFixed(2)} (< ${max})`,
      bestOverlap: best,
    };
  return { code: null, detail: `겹침 ${best.toFixed(2)}`, bestOverlap: best };
}

/** 제안 title 형식: {페이지명} | {상위 메뉴} | {사이트명} */
export function suggestTitle(pageName: string, parentMenu: string | null, siteName: string): string {
  return [pageName, parentMenu, siteName].filter(Boolean).join(" | ");
}

/** T3: 같은 사이트에서 같은 title을 N개 이상 공유하고 h1은 서로 다른 경우 — title 값당 1건 */
export function findMassShared(
  docs: { docId: number; title: string | null; h1: string | null }[],
  minShared = 10,
): { title: string; docIds: number[] }[] {
  const byTitle = new Map<string, { docId: number; h1: string | null }[]>();
  for (const d of docs) {
    const t = (d.title ?? "").trim();
    if (!t) continue;
    if (!byTitle.has(t)) byTitle.set(t, []);
    byTitle.get(t)!.push({ docId: d.docId, h1: d.h1 });
  }
  const out: { title: string; docIds: number[] }[] = [];
  for (const [title, list] of byTitle) {
    if (list.length < minShared) continue;
    const h1s = new Set(list.map((x) => (x.h1 ?? "").trim()).filter(Boolean));
    if (h1s.size > 1) out.push({ title, docIds: list.map((x) => x.docId) });
  }
  return out;
}
