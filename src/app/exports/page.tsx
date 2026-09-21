"use client";

import { useMounted } from "@/lib/useMounted";
import { useMemo, useState } from "react";
import { useIssues, useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";
import { buildManifest, canonicalMapCsv, download, kpiJson, noindexCsv, redirectMapCsv, sitemapXml, titleFixesCsv } from "@/lib/exports";
import { buildTicketsWorkbook, ticketRows } from "@/lib/tickets";

function Card({ name, desc, count, now, onDownload, children }: { name: string; desc: string; count: string; now: string; onDownload: () => void; children?: React.ReactNode }) {
  return (
    <div className="card p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="mono font-semibold">{name}</div>
          <div className="text-[12px] text-muted">{desc}</div>
        </div>
        <button className="btn btn-sm btn-primary" type="button" onClick={onDownload}>내려받기</button>
      </div>
      <div className="text-[12px] mt-2">{count} · 생성 {now}</div>
      {children}
    </div>
  );
}

export default function ExportsPage() {
  const issues = useIssues();
  const decisions = useStore((s) => s.decisions);
  const overrides = useStore((s) => s.canonicalOverrides);
  const vendorToken = useStore((s) => s.vendorToken);
  const issueVendorToken = useStore((s) => s.issueVendorToken);
  const mounted = useMounted();
  const [approvedOnly, setApprovedOnly] = useState(true);

  const manifest = useMemo(() => buildManifest(issues, overrides, approvedOnly), [issues, overrides, approvedOnly]);
  const dist = useMemo(() => {
    const d = { include: 0, exclude: 0, hold: 0 };
    for (const x of manifest.documents) d[x.index]++;
    return d;
  }, [manifest]);
  const tickets = useMemo(() => ticketRows(issues), [issues]);
  const byDept = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tickets) m.set(t.부서, (m.get(t.부서) ?? 0) + 1);
    return [...m.entries()];
  }, [tickets]);
  const lines = (s: string) => Math.max(0, s.split("\r\n").length - 1);
  const csvs = useMemo(
    () => ({
      canonical: canonicalMapCsv(overrides),
      redirect: redirectMapCsv(issues),
      title: titleFixesCsv(issues),
      noindex: noindexCsv(issues, decisions),
    }),
    [issues, overrides, decisions],
  );
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  if (!mounted) return <div className="p-6 text-muted">불러오는 중…</div>;

  return (
    <div className="pb-10">
      <PageHeader title="내보내기" sub="산출물은 두 갈래: 원본을 고치는 길(수정 요청서)과 인덱스를 보호하는 길(매니페스트). 승인된 이슈만 담는다." />
      <div className="px-6 grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card
          now={now}
          name="tickets.xlsx"
          desc="부서별 수정 요청서 — 시트: 요약 · 전체 · 부서별 · 용어설명. 받는 사람은 비개발자."
          count={`승인 ${tickets.length}건 · 부서 ${byDept.length}곳`}
          onDownload={() => download("tickets.xlsx", buildTicketsWorkbook(issues))}
        >
          <div className="mt-2 text-[12px]">
            {byDept.length === 0 ? (
              <span className="text-muted">이슈 큐에서 승인하면 여기에 쌓입니다.</span>
            ) : (
              <table className="tbl">
                <thead><tr><th>부서(시트)</th><th>건수</th></tr></thead>
                <tbody>{byDept.map(([d, n]) => <tr key={d}><td>{d}</td><td>{n}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        </Card>

        <Card
          now={now}
          name="manifest.json"
          desc="RAG 인덱스 매니페스트 v1.0 — 벤더는 include만 색인, alias_urls는 canonical_url로 치환, title_override 우선."
          count={`include ${dist.include} · hold ${dist.hold} · exclude ${dist.exclude} · facts ${manifest.facts.length}`}
          onDownload={() => download("manifest.json", JSON.stringify(manifest, null, 2), "application/json")}
        >
          <label className="text-[12px] mt-2 flex items-center gap-2">
            <input type="checkbox" checked={approvedOnly} onChange={(e) => setApprovedOnly(e.target.checked)} />
            approved_only — 사람이 승인한 제외만 exclude, 미승인 제안은 hold
          </label>
          <div className="text-[12px] mt-2">
            <div className="text-muted mb-1">벤더 읽기 전용 토큰</div>
            {vendorToken ? <code className="mono text-[11px] break-all">{vendorToken}</code> : <span className="text-muted">미발급</span>}
            <button className="btn btn-sm ml-2" type="button" onClick={() => issueVendorToken()}>{vendorToken ? "재발급" : "발급"}</button>
            <div className="text-muted mt-1 mono">GET /api/exports/manifest.json · Authorization: Bearer &lt;token&gt;</div>
          </div>
        </Card>

        <Card now={now} name="canonical_map.csv" desc="alias_url, canonical_url, rule, cluster_id" count={`${lines(csvs.canonical)}행`} onDownload={() => download("canonical_map.csv", csvs.canonical, "text/csv;charset=utf-8")} />
        <Card now={now} name="redirect_map.csv" desc="from_url, to_url, type(301), reason — 승인된 redirect 처분만" count={`${lines(csvs.redirect)}행`} onDownload={() => download("redirect_map.csv", csvs.redirect, "text/csv;charset=utf-8")} />
        <Card now={now} name="title_fixes.csv" desc="url, current_title, suggested_title, code, template — 승인된 D2만" count={`${lines(csvs.title)}행`} onDownload={() => download("title_fixes.csv", csvs.title, "text/csv;charset=utf-8")} />
        <Card now={now} name="noindex_list.csv" desc="url, reason, approved_by, approved_at — 승인된 archive·exclude_index" count={`${lines(csvs.noindex)}행`} onDownload={() => download("noindex_list.csv", csvs.noindex, "text/csv;charset=utf-8")} />
        <Card now={now} name="sitemap.xml" desc="include 문서의 canonical_url만" count={`${dist.include} URL`} onDownload={() => download("sitemap.xml", sitemapXml(manifest), "application/xml")} />
        <Card now={now} name="kpi.json" desc="중복률·title 오류·90일 미갱신·기한 만료·사실 충돌·죽은 링크·준비도 분포·부서별 미처리·LLM 비용" count="주간 시계열 8점" onDownload={() => download("kpi.json", JSON.stringify(kpiJson(issues, manifest), null, 2), "application/json")} />
      </div>

      <div className="px-6 mt-3">
        <div className="card p-4">
          <h2 className="font-semibold mb-1">매니페스트 미리 보기 (표본 문서 {manifest.documents.length}건)</h2>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>doc</th><th>index</th><th>사유</th><th>authority</th><th>유형</th><th>canonical_url</th><th>title_override</th></tr></thead>
              <tbody>
                {manifest.documents.map((d) => (
                  <tr key={d.doc_id}>
                    <td className="mono">{d.doc_id}</td>
                    <td><span className={`text-[11px] border rounded px-1 ${d.index === "include" ? "border-low/50 text-low" : d.index === "hold" ? "border-medium/50 text-medium" : "border-border text-muted"}`}>{d.index}</span></td>
                    <td className="mono text-[11px]">{d.reason_codes.join(", ")}</td>
                    <td className="mono">{d.authority}</td>
                    <td className="text-[12px]">{d.page_type}</td>
                    <td className="mono text-[11px] break-all">{d.canonical_url.replace("https://", "")}</td>
                    <td className="mono text-[11px]">{d.title_override ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
