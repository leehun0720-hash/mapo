"use client";

import Link from "next/link";
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
import { CONTENT_KPI_TARGETS, FOUR_TASKS, HANDBOOK_LINKS, KPI8_FROM_THIS_APP } from "@/data/handbook";

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

  const go = (q: Record<string, string>) => router.push("/issues?" + new URLSearchParams({ grade: "all", ...q }).toString());

  return (
    <div className="pb-10">
      <PageHeader
        title="업무 현황"
        sub="홈페이지의 정보 상태를 확인하고, 검토가 필요한 문서부터 처리하세요."
        right={
          <div className="flex gap-1.5 no-print">
            <button className="btn btn-sm" type="button" onClick={() => window.print()}>
              인쇄
            </button>
            <a className="btn btn-sm" href={HANDBOOK_LINKS.areaContent} target="_blank" rel="noopener noreferrer">
              핸드북 영역 ③ ↗
            </a>
          </div>
        }
      />
      <section className="px-6 mb-6" aria-label="오늘의 업무 안내">
        <div className="task-intro">
          <div><div className="eyebrow">담당자 업무 안내</div><h2>오늘 확인할 문서가 있습니다</h2><p>긴급 항목부터 내용을 확인하세요. 판단이 어려운 문서는 보류할 수 있습니다.</p></div>
          <Link href="/issues?grade=all" className="btn btn-primary">검토 시작하기 →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <Stat label="긴급 검토" value={mounted ? `${critical.length}건` : "–"} hint="개인정보 등 우선 확인이 필요한 항목" tone="critical" onClick={() => go({ grade: "all", severity: "critical" })} />
          <Stat label="검토 대기" value={mounted ? `${open.length}건` : "–"} hint="대기·재발 문서를 확인하세요" tone="accent" onClick={() => go({ grade: "all", status: "pending" })} />
          <Stat label="승인한 문서" value={mounted ? `${issues.filter(i => i.status === "approved").length}건` : "–"} hint="승인 내용을 수정 요청서로 내려받으세요" onClick={() => router.push("/exports")} />
        </div>
        <div className="quick-guide"><b>처음 사용하는 담당자를 위한 3단계</b><ol><li><span>1</span>문서를 선택하고 원문과 점검 사유를 확인합니다.</li><li><span>2</span>제안이 맞으면 승인, 틀리면 반려, 확인이 더 필요하면 보류합니다.</li><li><span>3</span>결과 내려받기에서 수정 요청서를 받아 소관 부서에 전달합니다.</li></ol><Link href="/help">자세한 사용 안내 →</Link></div>
      </section>
      <div className="px-6 mb-3"><h2 className="font-semibold text-lg">전체 점검 현황</h2><p className="text-muted text-sm">최근 점검 #{run.runId} · 점검 주소 {run.stats.urls.toLocaleString()}건 · 아래 수치는 시연용 전체 집계이며 검토 목록의 표본 건수와 다를 수 있습니다.</p></div>

      <section className="px-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3" aria-label="KPI 요약">
        <Stat label="중복률" value={pct(latest.dupRate)} hint={`지난주 ${pct(prev.dupRate)}`} onClick={() => go({ detector: "D1" })} />
        <Stat label="페이지 제목 오류" value={latest.titleErrors.toLocaleString()} hint={`지난주 ${prev.titleErrors.toLocaleString()}`} onClick={() => go({ detector: "D2" })} />
        <Stat label="90일 미갱신" value={latest.stale90d.toLocaleString()} hint="KPI ⑦ · 지표만 집계(이슈 아님)" />
        <Stat label="기한 만료" value={latest.expired.toLocaleString()} hint={`지난주 ${prev.expired}`} onClick={() => go({ detector: "D3" })} />
        <Stat label="사실 충돌" value={latest.factConflicts} hint={`지난주 ${prev.factConflicts}`} onClick={() => go({ detector: "D7" })} />
        <Stat label="연결되지 않는 링크" value={latest.brokenLinks} hint={`지난주 ${prev.brokenLinks}`} onClick={() => go({ detector: "D5" })} />
      </section>

      {run.stats.coverage && (
        <section className="px-6 mt-4" aria-label="점검 커버리지">
          <div className="card p-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <div>
              <div className="eyebrow">COVERAGE</div>
              <div className="text-[13px]">
                점검 커버리지 <b className="text-[18px]">{pct(run.stats.coverage.checked / run.stats.coverage.agreed)}</b>
                <span className="text-muted"> = 성공 점검 {run.stats.coverage.checked.toLocaleString()} ÷ 합의 범위 {run.stats.coverage.agreed.toLocaleString()} · 목표 ≥95%</span>
              </div>
            </div>
            <div className="text-[12px] text-muted">
              실패는 분모에 섞지 않고 따로 보고: 접근 불가 {run.stats.coverage.failed.access} · 추출 실패 {run.stats.coverage.failed.extract} · 미지원 첨부 {run.stats.coverage.failed.unsupported}
              <span className="ml-2">(미점검 자료를 정상으로 세지 않는다)</span>
            </div>
          </div>
        </section>
      )}

      <details className="mx-6 mt-4"><summary>세부 관리 지표와 업무 범위 보기</summary>
      <section className="px-6 mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3" aria-label="네 가지 과업">
        <div className="card p-4 xl:col-span-2">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <div>
              <div className="eyebrow">AREA 3 · FOUR TASKS</div>
              <h2 className="font-semibold">콘텐츠 정비 네 가지 과업 — 이 앱이 맡는 자리</h2>
            </div>
            <a className="text-[12px] text-accent" href={HANDBOOK_LINKS.areaContent} target="_blank" rel="noopener noreferrer">
              핸드북 영역 ③ 콘텐츠 정비 ↗
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {FOUR_TASKS.map((t) => {
              const n = open.filter((i) => (t.detectors as readonly string[]).includes(i.detector)).length;
              return (
                <div key={t.no} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      <span className="mono text-muted mr-2">{String(t.no).padStart(2, "0")}</span>
                      {t.name}
                    </div>
                    {t.detectors.length > 0 ? (
                      <button className="btn btn-sm" type="button" onClick={() => go({ detector: t.detectors[0] ?? "" })} disabled={!mounted}>
                        대기 <b>{mounted ? n : "–"}</b>
                      </button>
                    ) : (
                      <span className="chip">파일럿</span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted mt-1">{t.desc}</p>
                  <p className="text-[11px] mt-1">
                    <span className="text-muted">탐지기</span> {t.detectors.length ? t.detectors.join(" · ") : "—"} <span className="text-muted ml-2">산출물</span> {t.output}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-4">
          <div className="eyebrow">TARGETS</div>
          <h2 className="font-semibold mb-2">측정 지표 — 챗봇 정확도의 선행 지표</h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>지표</th>
                <th>이번 주</th>
                <th>목표 방향</th>
              </tr>
            </thead>
            <tbody>
              {CONTENT_KPI_TARGETS.map((t) => {
                const v = latest[t.key];
                const p = prev[t.key];
                const isRatio = t.key === "dupRate" || t.key === "structuredRatio";
                const better = t.key === "structuredRatio" ? v > p : v < p;
                return (
                  <tr key={t.key}>
                    <td>{t.name}</td>
                    <td className="mono whitespace-nowrap">
                      {isRatio ? pct(v) : v.toLocaleString()}{" "}
                      <span className={better ? "text-low" : "text-high"} aria-label={better ? "개선" : "악화"}>
                        {better ? "▾" : "▴"}
                      </span>
                    </td>
                    <td className="text-[12px] text-muted">{t.goal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-[11px] text-muted mt-2">
            핸드북 KPI 8개 중 ⑦ {KPI8_FROM_THIS_APP.name}은 이 앱이 매주 산출합니다.{" "}
            <a className="text-accent" href={HANDBOOK_LINKS.toolKpi} target="_blank" rel="noopener noreferrer">
              KPI 기록지 ↗
            </a>
          </p>
        </div>
      </section>

      </details>

      <section className="px-6 mt-4 grid grid-cols-1 xl:grid-cols-3 gap-3">
        <div className="card p-4 xl:col-span-2">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="eyebrow">KPI 7 · FRESHNESS</div>
              <h2 className="font-semibold">콘텐츠 신선도 추이</h2>
            </div>
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
                  <Line yAxisId="r" type="monotone" dataKey="titleErrors" name="페이지 제목 오류(건)" stroke="var(--high)" strokeWidth={2} dot={false} />
                  <Line yAxisId="r" type="monotone" dataKey="brokenLinks" name="연결되지 않는 링크(건)" stroke="var(--medium)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="font-semibold mb-2">이번 실행</h2>
          <div className="grid grid-cols-2 gap-2">
            <Stat label="대기 이슈" value={mounted ? open.length : "–"} onClick={() => go({ status: "pending" })} tone="accent" />
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
            <div>
              <div className="eyebrow">SITE SCORE</div>
              <h2 className="font-semibold">사이트별 위생 점수</h2>
            </div>
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
