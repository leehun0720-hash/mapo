"use client";

import { useMounted } from "@/lib/useMounted";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SITES } from "@/data/sites";
import { CURRENT_RUN, KPI_SERIES, RUNS, SITE_PROBLEM_DOCS } from "@/data/kpi";
import { SCORE_CAPS, SCORE_LABELS, SCORE_WEIGHTS, siteScore, type ScoreKey } from "@/lib/score";
import { useIssues } from "@/store/useStore";
import { PageHeader, Stat } from "@/components/ui";
import { DETECTOR_NAMES } from "@/data/messages";

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function Dashboard() {
  const router = useRouter();
  const issues = useIssues();
  const mounted = useMounted();

  const scores = useMemo(
    () =>
      SITES.map((s) => {
        const pd = SITE_PROBLEM_DOCS[s.siteId];
        const r = siteScore({ docCount: s.docCount, problemDocs: pd });
        return { site: s, ...r };
      }).sort((a, b) => a.score - b.score),
    [],
  );

  const open = issues.filter((i) => i.status === "open" || i.status === "regressed");
  const newThisRun = issues.filter((i) => i.firstSeenRun === CURRENT_RUN);
  const regressed = issues.filter((i) => i.status === "regressed");
  const critical = open.filter((i) => i.severity === "critical");
  const byDept = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of open) m.set(i.department, (m.get(i.department) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [open]);
  const byDetector = useMemo(() => {
    const m = new Map<string, number>();
    for (const i of open) m.set(i.detector, (m.get(i.detector) ?? 0) + 1);
    return [...m.entries()].sort();
  }, [open]);
  const latest = KPI_SERIES[KPI_SERIES.length - 1];
  const prev = KPI_SERIES[KPI_SERIES.length - 2];
  const run = RUNS.find((r) => r.runId === CURRENT_RUN)!;

  const go = (q: Record<string, string>) => router.push("/issues?" + new URLSearchParams(q).toString());

  return (
    <div className="pb-10">
      <PageHeader
        title="대시보드"
        sub={`실행 #${run.runId} · ${run.kind} · URL ${run.stats.urls.toLocaleString()}건 · 오류율 ${pct(run.stats.errorRate)} · LLM 비용 ${run.stats.llmCostKrw.toLocaleString()}원`}
      />

      <section className="px-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3" aria-label="KPI 요약">
        <Stat label="중복률" value={pct(latest.dupRate)} hint={`지난주 ${pct(prev.dupRate)}`} onClick={() => go({ detector: "D1" })} />
        <Stat label="title 오류" value={latest.titleErrors.toLocaleString()} hint={`지난주 ${prev.titleErrors.toLocaleString()}`} onClick={() => go({ detector: "D2" })} />
        <Stat label="90일 미갱신" value={latest.stale90d.toLocaleString()} hint="지표만 집계(이슈 아님)" />
        <Stat label="기한 만료" value={latest.expired.toLocaleString()} hint={`지난주 ${prev.expired}`} onClick={() => go({ detector: "D3" })} />
        <Stat label="사실 충돌" value={latest.factConflicts} hint={`지난주 ${prev.factConflicts}`} onClick={() => go({ detector: "D7" })} />
        <Stat label="죽은 링크" value={latest.brokenLinks} hint={`지난주 ${prev.brokenLinks}`} onClick={() => go({ detector: "D5" })} />
      </section>

      <section className="px-6 mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="card p-4 xl:col-span-2">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">KPI ⑦ 콘텐츠 신선도 추이</h2>
            <span className="text-[12px] text-muted">주간 자동 산출 · 매니페스트 포함 비율 {pct(latest.includeRatio)}</span>
          </div>
          <div className="h-56">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={KPI_SERIES.map((k) => ({ ...k, dupPct: +(k.dupRate * 100).toFixed(1), incPct: +(k.includeRatio * 100).toFixed(1) }))}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke="var(--muted)" fontSize={11} />
                  <YAxis yAxisId="l" stroke="var(--muted)" fontSize={11} unit="%" />
                  <YAxis yAxisId="r" orientation="right" stroke="var(--muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
                  <Line yAxisId="l" type="monotone" dataKey="dupPct" name="중복률(%)" stroke="var(--accent)" strokeWidth={2} dot={false} />
                  <Line yAxisId="l" type="monotone" dataKey="incPct" name="매니페스트 포함(%)" stroke="var(--low)" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="titleErrors" name="title 오류(건)" stroke="var(--high)" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="brokenLinks" name="죽은 링크(건)" stroke="var(--medium)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">이번 실행</h2>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="대기 이슈" value={mounted ? open.length : "–"} onClick={() => go({ status: "open" })} tone="accent" />
            <Stat label="새 이슈" value={mounted ? newThisRun.length : "–"} hint={`실행 #${CURRENT_RUN}`} onClick={() => go({ run: String(CURRENT_RUN) })} />
            <Stat label="재발" value={mounted ? regressed.length : "–"} onClick={() => go({ status: "regressed" })} tone={regressed.length ? "critical" : undefined} />
            <Stat label="개인정보 긴급" value={mounted ? critical.length : "–"} hint="즉시 알림 대상" onClick={() => go({ severity: "critical" })} tone={critical.length ? "critical" : undefined} />
          </div>
          <h3 className="text-[12px] text-muted mt-4 mb-1">탐지기별 대기</h3>
          <div className="flex flex-wrap gap-1.5">
            {byDetector.map(([d, n]) => (
              <button key={d} className="btn btn-sm" onClick={() => go({ detector: d })} type="button">
                {d} {DETECTOR_NAMES[d]} <b>{n}</b>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="card p-4 xl:col-span-2 overflow-x-auto">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-semibold">사이트별 위생 점수</h2>
            <span className="text-[12px] text-muted mono">score = 100 − Σ weight × min(1, rate ÷ cap)</span>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>사이트</th>
                <th>문서</th>
                <th>점수</th>
                {(Object.keys(SCORE_WEIGHTS) as ScoreKey[]).map((k) => (
                  <th key={k} title={`가중치 ${SCORE_WEIGHTS[k]} · 상한 ${SCORE_CAPS[k]}`}>
                    {SCORE_LABELS[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.map(({ site, score, parts }) => (
                <tr key={site.siteId}>
                  <td>
                    <div className="font-medium">{site.name}</div>
                    <div className="text-[11px] text-muted mono">{site.baseUrl.replace("https://", "")}</div>
                  </td>
                  <td>{site.crawlMode === "linkcheck_only" ? <span className="text-muted">링크만</span> : site.docCount.toLocaleString()}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded bg-background overflow-hidden" aria-hidden>
                        <div className="h-full bg-accent" style={{ width: `${score}%` }} />
                      </div>
                      <b>{score}</b>
                    </div>
                  </td>
                  {(Object.keys(SCORE_WEIGHTS) as ScoreKey[]).map((k) => (
                    <td key={k} className="mono">
                      <span title={`감점 ${parts[k].penalty.toFixed(1)}`}>{site.docCount ? pct(parts[k].rate) : "–"}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-muted mt-2">가중치·상한은 config.score 초기값. 산식을 리포트에 그대로 공개한다.</p>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">부서별 미처리</h2>
          {mounted && byDept.length === 0 && <p className="text-muted text-[13px]">미처리 이슈가 없습니다.</p>}
          <ul className="space-y-1">
            {mounted &&
              byDept.map(([dept, n]) => (
                <li key={dept}>
                  <button className="w-full flex justify-between items-center px-2 py-1.5 rounded hover:bg-background text-left" onClick={() => go({ department: dept })} type="button">
                    <span>{dept}</span>
                    <b>{n}</b>
                  </button>
                </li>
              ))}
          </ul>
          <p className="text-[11px] text-muted mt-3">월간 리포트에 부서별 미처리 현황을 표기한다.</p>
        </div>
      </section>
    </div>
  );
}
