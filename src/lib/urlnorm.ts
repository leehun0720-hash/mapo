// 구성명세서 6.2 정규화기 — Python 검증 코드를 TypeScript로 옮김.
// 주의: URL 전체에 HTML unescape를 쓰면 &currentPage → ¤tPage 로 깨진다. 오직 "&amp;" 문자열만 되돌린다.

const TRACKING = /^(utm_.+|fbclid|gclid)$/i;
const JSESSION = /;jsessionid=[^?#/]*/gi;

export type UrlFlag = "escape_bug" | "jsessionid" | "state_params" | "http_link";

export interface NormalizeResult {
  urlNorm: string;
  flags: UrlFlag[];
}

export function normalizeUrl(
  url: string,
  noiseParams: ReadonlySet<string> = new Set(),
): NormalizeResult {
  const flags: UrlFlag[] = [];
  const add = (f: UrlFlag) => {
    if (!flags.includes(f)) flags.push(f);
  };
  let u = url.trim();
  if (u.includes("&amp;")) {
    add("escape_bug");
    while (u.includes("&amp;")) u = u.replace(/&amp;/g, "&"); // &amp;amp; 까지 풀기
  }
  if (/;jsessionid=/i.test(u)) {
    add("jsessionid");
    u = u.replace(JSESSION, "");
  }

  // 수동 분해 — 파라미터 순서·빈 키 처리를 직접 한다.
  const m = u.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):\/\/([^/?#]*)([^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!m) throw new Error("절대 URL이 아닙니다: " + url);
  const scheme = m[1].toLowerCase();
  let hostport = m[2].toLowerCase();
  let path = m[3] || "/";
  const query = m[4] ? m[4].slice(1) : "";

  // 기본 포트 제거
  const hp = hostport.match(/^([^:]*)(?::(\d+))?$/);
  if (hp) {
    const host = hp[1];
    const port = hp[2] ? Number(hp[2]) : null;
    hostport = port && port !== 80 && port !== 443 ? `${host}:${port}` : host;
  }

  path = path.replace(/\/{2,}/g, "/") || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

  const kept: [string, string][] = [];
  if (query) {
    for (const pair of query.split("&")) {
      if (pair === "") continue; // '&&' 같은 빈 조각
      const eq = pair.indexOf("=");
      let k = eq >= 0 ? pair.slice(0, eq) : pair;
      const v = eq >= 0 ? pair.slice(eq + 1) : "";
      if (k.startsWith("amp;")) {
        k = k.slice(4);
        add("escape_bug");
      }
      if (!k || (k === "amp" && v === "")) {
        // '&amp=&' 잔재
        add("escape_bug");
        continue;
      }
      if (TRACKING.test(k) || noiseParams.has(k)) continue;
      kept.push([k, v]);
    }
  }
  if (new Set(kept.map(([k]) => k)).size >= 5) add("state_params");
  kept.sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0,
  );
  if (scheme === "http") add("http_link");

  const qs = kept.map(([k, v]) => `${k}=${v}`).join("&");
  return { urlNorm: `https://${hostport}${path}${qs ? "?" + qs : ""}`, flags };
}

/** 경로 패턴: 숫자·해시 구간을 {id}로 치환 (파라미터 유의성 실험의 그룹 키) */
export function pathPattern(url: string): string {
  try {
    const p = new URL(url).pathname;
    return p
      .replace(/\/\d+(?=\/|$)/g, "/{id}")
      .replace(/\/[0-9a-f]{16,}(?=\/|$)/gi, "/{id}");
  } catch {
    return url;
  }
}
