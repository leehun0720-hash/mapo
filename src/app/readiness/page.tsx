"use client";

import { useMounted } from "@/lib/useMounted";
import { useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";
import {
  APP_SCOPE_SENTENCE,
  INTERVIEW,
  MVP_BOUNDARY,
  OPEN_GATES,
  PILOT_MIN_CONDITIONS,
  QUALITY_TARGETS,
  RACI,
  RELEASE_STATUS,
  REQUIREMENTS,
  RISKS,
  RISK_STATUSES,
  SLA,
  THREE_LAYERS,
  type ReqStatus,
} from "@/data/business";

const REQ_TONE: Record<ReqStatus, string> = {
  검증됨: "text-low border-low/50",
  미검증: "text-medium border-medium/50",
  미구현: "text-muted border-border",
  미확정: "text-high border-high/50",
};

export default function ReadinessPage() {
  const mounted = useMounted();
  const gateChecked = useStore((s) => s.gateChecked);
  const toggleGate = useStore((s) => s.toggleGate);
  const riskStatus = useStore((s) => s.riskStatus);
  const setRiskStatus = useStore((s) => s.setRiskStatus);
  const answers = useStore((s) => s.interviewAnswers);
  const setAnswer = useStore((s) => s.setInterviewAnswer);
  const pilot = useStore((s) => s.pilotConditions);
  const togglePilot = useStore((s) => s.togglePilotCondition);

  if (!mounted) return <div className="p-6 text-muted">불러오는 중…</div>;

  const counts = REQUIREMENTS.reduce<Record<string, number>>((m, r) => ({ ...m, [r.status]: (m[r.status] ?? 0) + 1 }), {});
  const gatesDone = OPEN_GATES.filter((g) => gateChecked[g.id]).length;
  const pilotDone = PILOT_MIN_CONDITIONS.filter((_, i) => pilot[i]).length;
  const answered = INTERVIEW.filter((q) => (answers[q.id] ?? "").trim()).length;

  return (
    <div className="pb-10">
      <PageHeader title="운영 준비 점검" sub="기능이 기획서에 있다는 이유만으로 구현 또는 검증 완료로 표시하지 않는다. 목표를 달성 실적으로 홍보하지 않는다." />
      <div className="px-6 space-y-3">
        <section className="card p-4">
          <div className="eyebrow">RELEASE STATUS</div>
          <div className="mono text-[13px] mt-1">{RELEASE_STATUS[0]}</div>
          <div className="mono text-[13px]">{RELEASE_STATUS[1]}</div>
          <p className="text-[12px] text-muted mt-2">{APP_SCOPE_SENTENCE}</p>
        </section>

        <section className="card p-4">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
            <div>
              <div className="eyebrow">REQUIREMENTS</div>
              <h2 className="font-semibold">요구사항·검수 추적표 (REQ01~16)</h2>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["검증됨", "미검증", "미구현", "미확정"] as ReqStatus[]).map((s) => (
                <span key={s} className={`chip ${REQ_TONE[s]}`}>{s} {counts[s] ?? 0}</span>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-muted mb-2">‘검증됨’은 제공 MVP의 특정 소프트웨어 시험 범위다. 현장 전체·모델 정확도·보안/접근성 인증 통과를 뜻하지 않는다.</p>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>ID</th><th>요구사항</th><th>우선</th><th>구현 구분</th><th>검수 조건</th><th>상태</th><th>증빙 / 남은 작업</th><th>이 화면에서</th></tr></thead>
              <tbody>
                {REQUIREMENTS.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td>
                    <td className="font-medium whitespace-nowrap">{r.text}</td>
                    <td className="mono">{r.priority}</td>
                    <td className="text-[12px] whitespace-nowrap">{r.kind}</td>
                    <td className="text-[12px]">{r.acceptance}</td>
                    <td><span className={`chip ${REQ_TONE[r.status]}`}>{r.status}</span></td>
                    <td className="text-[12px]">{r.evidence}</td>
                    <td className="text-[12px] text-accent">{r.here ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="eyebrow">OPEN GATES</div>
            <h2 className="font-semibold mb-1">오픈 승인 체크리스트 — {gatesDone} / {OPEN_GATES.length}</h2>
            <p className="text-[12px] text-muted mb-2">아래 관문을 통과하지 않았다면 고객 운영망에 올리지 않는다. 체크는 이 브라우저에만 저장된다.</p>
            <ul className="space-y-1.5">
              {OPEN_GATES.map((g) => (
                <li key={g.id} className="flex gap-2 items-start">
                  <input type="checkbox" className="mt-1" checked={!!gateChecked[g.id]} onChange={() => toggleGate(g.id)} aria-label={g.gate} />
                  <div>
                    <div className="text-[13px] font-medium">{g.gate} <span className="text-[11px] text-muted font-normal">· 현재: {g.current}</span></div>
                    <div className="text-[12px] text-muted">필수 증빙: {g.evidence}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <div className="eyebrow">FIRST PILOT</div>
            <h2 className="font-semibold mb-1">첫 파일럿 착수의 최소 조건 — {pilotDone} / {PILOT_MIN_CONDITIONS.length}</h2>
            <ul className="space-y-1.5 mb-3">
              {PILOT_MIN_CONDITIONS.map((c, i) => (
                <li key={c} className="flex gap-2 items-center">
                  <input type="checkbox" checked={!!pilot[i]} onChange={() => togglePilot(i)} aria-label={c} />
                  <span className="text-[13px]">{c}</span>
                </li>
              ))}
            </ul>
            <div className="eyebrow">THREE LAYERS</div>
            <h3 className="font-semibold text-[13px] mb-1">검수의 세 층 — 하나만 통과해서는 완료 처리하지 않는다</h3>
            <ul className="text-[12px] space-y-0.5">
              {THREE_LAYERS.map(([n, d]) => (
                <li key={n}><b>{n}</b> — {d}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card p-4">
          <div className="eyebrow">RISK REGISTER</div>
          <h2 className="font-semibold mb-1">위험등록부 — 출시 전에 닫을 항목</h2>
          <p className="text-[12px] text-muted mb-2">모든 위험을 0으로 만들었다는 선언 대신 미결 위험의 책임자·수용 승인·대응 기한을 남긴다.</p>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>ID</th><th>위험</th><th>우선</th><th>책임자</th><th>대응</th><th>완료 증빙</th><th>상태</th></tr></thead>
              <tbody>
                {RISKS.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td>
                    <td className="font-medium whitespace-nowrap">{r.risk}</td>
                    <td><span className={`chip ${r.priority === "높음" ? "text-high border-high/50" : ""}`}>{r.priority}</span></td>
                    <td className="text-[12px] whitespace-nowrap">{r.owner}</td>
                    <td className="text-[12px]">{r.response}</td>
                    <td className="text-[12px]">{r.evidence}</td>
                    <td>
                      <select className="input" value={riskStatus[r.id] ?? "대기"} onChange={(e) => setRiskStatus(r.id, e.target.value as (typeof RISK_STATUSES)[number])} aria-label={`${r.id} 상태`}>
                        {RISK_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-4">
          <div className="eyebrow">DISCOVERY</div>
          <h2 className="font-semibold mb-1">첫 미팅 질문지 (계약 전 확인) — 답변 {answered} / {INTERVIEW.length}</h2>
          <p className="text-[12px] text-muted mb-2">무상 상담에서는 범위·담당자만 확인하고, 전수 진단·정본 판정·과업지시서 작성은 유료 과업으로 전환한다. 답변 미확정이면 계약 범위와 비용 확정을 보류한다.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {INTERVIEW.map((q) => (
              <div key={q.id} className="border border-border rounded-lg p-3">
                <div className="text-[12px] text-muted"><span className="mono">{q.id}</span> · {q.topic}</div>
                <div className="text-[13px] font-medium mt-0.5">{q.question}</div>
                <textarea className="input mt-2 h-16" placeholder="고객 답변 (미입력)" value={answers[q.id] ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)} aria-label={q.question} />
                <div className="text-[11px] text-muted mt-1">필요 증빙: {q.evidence}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="eyebrow">RACI</div>
            <h2 className="font-semibold mb-2">조직·역할·책임 — 고객 부서가 참여해야 완료되는 사업</h2>
            <table className="tbl">
              <thead><tr><th>업무</th><th>최종 책임 A</th><th>수행 R</th><th>협의 C</th></tr></thead>
              <tbody>
                {RACI.map((r) => (
                  <tr key={r.task}><td className="font-medium">{r.task}</td><td className="text-[12px]">{r.a}</td><td className="text-[12px]">{r.r}</td><td className="text-[12px]">{r.c}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted mt-2">부서별 주 20건, 검토 요청 후 5근무일 회신을 협의. 기한 초과는 자동 승인이 아니라 ‘대기’. 백업 승인자를 기록한다.</p>
          </div>
          <div className="card p-4">
            <div className="eyebrow">QUALITY</div>
            <h2 className="font-semibold mb-2">품질 평가와 검수 기준 — 권고 파일럿 목표</h2>
            <table className="tbl">
              <thead><tr><th>지표</th><th>계산 / 측정</th><th>목표</th></tr></thead>
              <tbody>
                {QUALITY_TARGETS.map((t) => (
                  <tr key={t.metric}><td className="font-medium whitespace-nowrap">{t.metric}</td><td className="text-[12px]">{t.how}</td><td className="text-[12px]">{t.goal}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted mt-2">독립 평가셋 200사례(정상·중복·기한·PII·구조화·보존 예외·공격 문구)는 챗봇 200문항과 다른 콘텐츠 품질 평가셋. 적은 표본의 100%를 전수 무오류로 일반화하지 않는다.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="card p-4">
            <div className="eyebrow">MVP vs COMMERCIAL</div>
            <h2 className="font-semibold mb-2">제공 MVP와 상용 제품의 경계</h2>
            <table className="tbl">
              <thead><tr><th>항목</th><th>이번 실행 앱</th><th>상용화 잔여 과업</th></tr></thead>
              <tbody>
                {MVP_BOUNDARY.map((m) => (
                  <tr key={m.item}><td className="font-medium whitespace-nowrap">{m.item}</td><td className="text-[12px]">{m.mvp}</td><td className="text-[12px]">{m.commercial}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-4">
            <div className="eyebrow">SLA · INCIDENT</div>
            <h2 className="font-semibold mb-1">운영 서비스·SLA·사고 대응</h2>
            <p className="text-[12px]">{SLA.monthly}</p>
            <table className="tbl mt-2">
              <tbody>
                {SLA.response.map(([k, v]) => (
                  <tr key={k}><td className="text-[12px]">{k}</td><td className="mono text-[12px]">{v}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted mt-2">{SLA.note}</p>
            <h3 className="font-semibold text-[13px] mt-3 mb-1">사고 대응 순서</h3>
            <ol className="text-[12px] list-decimal pl-5 space-y-0.5">
              {SLA.incident.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <p className="text-[11px] text-muted mt-1">증거를 없애는 로그 삭제를 먼저 실행하지 않는다.</p>
            <h3 className="font-semibold text-[13px] mt-3 mb-1">운영 주기</h3>
            <table className="tbl">
              <tbody>
                {SLA.cycle.map(([w, t, o]) => (
                  <tr key={w}><td className="whitespace-nowrap text-[12px] font-medium">{w}</td><td className="text-[12px]">{t}</td><td className="text-[12px] text-muted">{o}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
