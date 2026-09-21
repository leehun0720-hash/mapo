"use client";

import { useMemo, useState } from "react";
import { normalizeUrl, pathPattern } from "@/lib/urlnorm";
import { maskText } from "@/lib/pii";
import { checkTitle, suggestTitle } from "@/lib/title";
import { useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";
import { PII_SEVERITY } from "@/lib/pii";
import { SEVERITY_LABEL } from "@/data/messages";

const SAMPLE_URLS = [
  "https://WWW.mapo.go.kr/site/main/board/notice/12345?cp=3&amp=&sortOrder=BA_REGDATE&bcId=notice&baNotice=false",
  "http://www.mapo.go.kr/site/main/board/notice/12345?bcId=notice&amp;cp=1#top",
  "https://www.mapo.go.kr/site/main/board/notice/12345;jsessionid=ABC123?bcId=notice",
  "https://www.mapo.go.kr//site/main/list/?currentPage=2&utm_source=kakao",
  "https://www.mapo.go.kr/nPortal/gosi/view/58340?cp=1&sortOrder=BA_REGDATE&searchCategory=&searchKeyword=&pageSize=10&viewMode=list&listType=A&menuLevel=2&baNotice=false",
];

export default function ToolsPage() {
  const rules = useStore((s) => s.rules);
  const [urls, setUrls] = useState(SAMPLE_URLS.join("\n"));
  const [text, setText] = useState("담당자 김○○ 010-1234-5678, 응시번호 3번 900101-1234567, 환급계좌 국민은행 123-45-678901. 문의 02-3153-8330");
  const [citizen, setCitizen] = useState(true);
  const [t, setT] = useState({ title: "민원실 종합안내 | 마포구청", h1: "주택/건축 민원", crumb: "민원 > 주택/건축 민원", isHome: false });

  const noise = useMemo(() => new Set(rules.noiseParams), [rules.noiseParams]);
  const normResults = useMemo(
    () =>
      urls.split("\n").map((u) => u.trim()).filter(Boolean).map((u) => {
        try {
          const n = normalizeUrl(u, noise);
          return { u, ...n, pattern: pathPattern(n.urlNorm), err: null };
        } catch (e) {
          return { u, urlNorm: "", flags: [], pattern: "", err: (e as Error).message };
        }
      }),
    [urls, noise],
  );
  const groups = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of normResults) if (r.urlNorm) m.set(r.urlNorm, (m.get(r.urlNorm) ?? 0) + 1);
    return m;
  }, [normResults]);

  const pii = useMemo(() => maskText(text, { citizenPost: citizen, whitelistPhones: ["02-3153-8330"] }), [text, citizen]);
  const crumb = t.crumb.split(">").map((s) => s.trim()).filter(Boolean);
  const titleRes = checkTitle({ title: t.title, h1: t.h1, breadcrumb: crumb, isHome: t.isHome, siteDefaultTitle: "마포구청 | 대표사이트" });

  return (
    <div className="pb-10">
      <PageHeader title="검사 도구" sub="명세서에서 실행 검증된 규칙을 브라우저에서 바로 돌려 본다. 네트워크 요청은 하지 않는다." />
      <div className="px-6 grid grid-cols-1 xl:grid-cols-2 gap-3">
        <div className="card p-4 xl:col-span-2">
          <h2 className="font-semibold">URL 정규화 (6.2)</h2>
          <p className="text-[12px] text-muted mb-2">&amp;amp; 되돌리기 → jsessionid 제거 → 호스트 소문자·기본 포트·프래그먼트·슬래시 정리 → 추적·잡음 파라미터 제거 → 키 정렬. 잡음 파라미터는 규칙 편집의 값을 쓴다 ({rules.noiseParams.length}개).</p>
          <textarea className="input mono h-32" value={urls} onChange={(e) => setUrls(e.target.value)} aria-label="URL 목록" />
          <table className="tbl mt-2">
            <thead><tr><th>입력</th><th>정규화 결과</th><th>플래그</th><th>경로 패턴</th></tr></thead>
            <tbody>
              {normResults.map((r, i) => (
                <tr key={i}>
                  <td className="mono text-[11px] break-all max-w-xs">{r.u}</td>
                  <td className="mono text-[11px] break-all">{r.err ? <span className="text-critical">{r.err}</span> : <>{r.urlNorm} {groups.get(r.urlNorm)! > 1 && <span className="text-accent">(×{groups.get(r.urlNorm)} 합쳐짐)</span>}</>}</td>
                  <td className="mono text-[11px]">{r.flags.join(", ") || "–"}</td>
                  <td className="mono text-[11px]">{r.pattern}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold">개인정보 탐지·마스킹 (D8)</h2>
          <p className="text-[12px] text-muted mb-2">주민등록번호(앞 6자리 날짜 유효성)·외국인등록번호·휴대전화·계좌 추정·시민 이메일. 기관 전화는 화이트리스트로 제외. 저장·LLM 전송 전 마스킹.</p>
          <textarea className="input h-28" value={text} onChange={(e) => setText(e.target.value)} aria-label="검사할 본문" />
          <label className="text-[12px] flex items-center gap-2 mt-1"><input type="checkbox" checked={citizen} onChange={(e) => setCitizen(e.target.checked)} /> 시민 작성 게시판(이메일도 탐지)</label>
          <div className="mt-2 text-[12px] text-muted">마스킹본</div>
          <div className="mono text-[12px] bg-background rounded p-2 mt-1 whitespace-pre-wrap">{pii.masked}</div>
          <table className="tbl mt-2">
            <thead><tr><th>코드</th><th>심각도</th><th>원문</th><th>마스킹</th></tr></thead>
            <tbody>
              {pii.hits.length === 0 && <tr><td colSpan={4} className="text-muted">탐지 없음</td></tr>}
              {pii.hits.map((h, i) => (
                <tr key={i}><td className="mono text-[11px]">{h.code}</td><td>{SEVERITY_LABEL[PII_SEVERITY[h.code]]}</td><td className="mono text-[11px]">{h.match}</td><td className="mono text-[11px]">{h.masked}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold">title 규칙 (D2 T1~T4)</h2>
          <p className="text-[12px] text-muted mb-2">T1 누락 → T2 사이트 기본값 → T4 title 조각과 h1·브레드크럼 명사 겹침 &lt; 0.2. T5(의미 판정)는 LLM 단계.</p>
          <div className="grid grid-cols-1 gap-2">
            <label className="text-[12px]">title<input className="input mt-1" value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></label>
            <label className="text-[12px]">h1<input className="input mt-1" value={t.h1} onChange={(e) => setT({ ...t, h1: e.target.value })} /></label>
            <label className="text-[12px]">브레드크럼 (&gt; 구분)<input className="input mt-1" value={t.crumb} onChange={(e) => setT({ ...t, crumb: e.target.value })} /></label>
            <label className="text-[12px] flex items-center gap-2"><input type="checkbox" checked={t.isHome} onChange={(e) => setT({ ...t, isHome: e.target.checked })} /> 홈 페이지</label>
          </div>
          <div className={`mt-3 rounded p-3 border ${titleRes.code ? "border-high/50" : "border-low/50"}`}>
            <div className="mono font-semibold">{titleRes.code ?? "통과"}</div>
            <div className="text-[12px] text-muted">{titleRes.detail}</div>
            {titleRes.code && <div className="text-[12px] mt-1">제안: <span className="mono">{suggestTitle(t.h1 || crumb[crumb.length - 1] || "", crumb.length > 1 ? crumb[crumb.length - 2] : null, "마포구청")}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
