// 구성명세서 6.4 D8 개인정보 — 정규식 + 화이트리스트 + 마스킹

export type PiiCode = "D8_RRN" | "D8_FRN" | "D8_MOBILE" | "D8_ACCOUNT" | "D8_EMAIL_CITIZEN";

export interface PiiHit {
  code: PiiCode;
  match: string;
  index: number;
  masked: string;
}

const RRN = /\d{6}[-\s]?[1-8]\d{6}/g;
const MOBILE = /01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const ACCOUNT =
  /(국민|신한|우리|하나|농협|기업|카카오|토스|새마을|우체국|SC|씨티)\s*(은행)?[^\d\n]{0,10}(\d{2,6}[-\s]\d{2,6}[-\s]\d{2,8}(?:[-\s]\d{1,6})?)/g;

/** 주민등록번호 앞 6자리 날짜 유효성 */
export function validBirth6(s: string): boolean {
  const mm = Number(s.slice(2, 4));
  const dd = Number(s.slice(4, 6));
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;
  return true;
}

export function maskDigits(s: string, keepHead = 6): string {
  let seen = 0;
  return s.replace(/\d/g, (d) => (seen++ < keepHead ? d : "*"));
}

export interface PiiOptions {
  /** 기관 대표·부서 전화(공개 정보) — 탐지에서 제외 */
  whitelistPhones?: string[];
  /** 시민 작성 게시판이면 이메일도 이슈 */
  citizenPost?: boolean;
}

export function detectPii(text: string, opt: PiiOptions = {}): PiiHit[] {
  const hits: PiiHit[] = [];
  const wl = new Set((opt.whitelistPhones ?? []).map((p) => p.replace(/\D/g, "")));

  for (const m of text.matchAll(RRN)) {
    const digits = m[0].replace(/\D/g, "");
    if (!validBirth6(digits)) continue;
    const seventh = Number(digits[6]);
    const code: PiiCode = seventh >= 5 && seventh <= 8 ? "D8_FRN" : "D8_RRN";
    hits.push({ code, match: m[0], index: m.index ?? 0, masked: maskDigits(m[0], 6) });
  }
  for (const m of text.matchAll(MOBILE)) {
    const digits = m[0].replace(/\D/g, "");
    if (wl.has(digits)) continue;
    const idx = m.index ?? 0;
    if (hits.some((h) => idx >= h.index && idx < h.index + h.match.length)) continue;
    hits.push({ code: "D8_MOBILE", match: m[0], index: idx, masked: maskDigits(m[0], 3) });
  }
  for (const m of text.matchAll(ACCOUNT)) {
    const acct = m[3];
    const start = (m.index ?? 0) + m[0].indexOf(acct);
    hits.push({ code: "D8_ACCOUNT", match: acct, index: start, masked: maskDigits(acct, 3) });
  }
  if (opt.citizenPost) {
    for (const m of text.matchAll(EMAIL)) {
      const [local, domain] = m[0].split("@");
      hits.push({
        code: "D8_EMAIL_CITIZEN",
        match: m[0],
        index: m.index ?? 0,
        masked: local.slice(0, 2) + "***@" + domain,
      });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

/** 마스킹본 — 저장·LLM 전송 전에 반드시 거친다 */
export function maskText(text: string, opt: PiiOptions = {}): { masked: string; hits: PiiHit[] } {
  const hits = detectPii(text, opt);
  let out = "";
  let cursor = 0;
  for (const h of hits) {
    if (h.index < cursor) continue;
    out += text.slice(cursor, h.index) + h.masked;
    cursor = h.index + h.match.length;
  }
  out += text.slice(cursor);
  return { masked: out, hits };
}

export const PII_SEVERITY: Record<PiiCode, "critical" | "high" | "medium" | "low"> = {
  D8_RRN: "critical",
  D8_FRN: "critical",
  D8_MOBILE: "high",
  D8_ACCOUNT: "medium",
  D8_EMAIL_CITIZEN: "low",
};
