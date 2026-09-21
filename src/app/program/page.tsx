"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMounted } from "@/lib/useMounted";
import { useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";
import { computeCashflow, computeQuote, fmtMan, type Assumptions } from "@/lib/quote";
import { EXCLUDED_TASKS, ONE_SENTENCE, PROCESS_STEPS, PRODUCTS, PRODUCT_NAME, PRODUCT_TAGLINE, QUALIFICATION_RULE, WBS, WBS_STATUSES, WORK_UNITS } from "@/data/business";

const ASSUMPTION_FIELDS: { key: keyof Assumptions; label: string; unit: string; step?: number; note: string }[] = [
  { key: "diagnosePrice", label: "진단 계약 단가", unit: "만원/건", note: "2주·200건 표본·시스템 변경 제외" },
  { key: "pilotPrice", label: "파일럿 계약 단가", unit: "만원/건", note: "6~8주·200건·구조화 50건·기관 검수" },
  { key: "siPrice", label: "SI 제안금액", unit: "만원/건", note: "공급 범위 확정 후 재산정" },
  { key: "careMonthly", label: "월 운영료", unit: "만원/기관", note: "월 정비 40건·원격지원 8시간 상한 합의" },
  { key: "diagnoseDirectRatio", label: "진단 직접비율", unit: "비율", step: 0.05, note: "현금 시나리오 가정. 실적 원가로 교체" },
  { key: "pilotDirectRatio", label: "파일럿 직접비율", unit: "비율", step: 0.05, note: "현금 시나리오 가정" },
  { key: "careDirectRatio", label: "운영 직접비율", unit: "비율", step: 0.05, note: "인력+인프라+도구. 공통비와 중복 금지" },
  { key: "contingencyRatio", label: "예비비율", unit: "비율", step: 0.05, note: "프로젝트 직접비 기준" },
  { key: "targetMargin", label: "목표 프로젝트 이익률", unit: "비율", step: 0.05, note: "제안금액 대비, 공통비/세금 전" },
  { key: "vatRate", label: "VAT 예시 세율", unit: "비율", step: 0.01, note: "표시용. 세무 판단은 별도" },
  { key: "startingCash", label: "시작 현금", unit: "만원", note: "실제 자금 미확인. 예시 입력" },
  { key: "monthlyOverhead", label: "월 공통 운영비", unit: "만원/월", note: "대표 영업·관리·사무비" },
  { key: "initialProductInvest", label: "초기 공통 제품개발 투자", unit: "만원", note: "1개월차 현금 지출" },
  { key: "infraApi", label: "인프라/API", unit: "만원/SI건", note: "고객 실제 공급 견적으로 교체" },
  { key: "travelTraining", label: "출장/교육", unit: "만원/SI건", note: "2회 교육 등 가정" },
  { key: "toolsLicense", label: "외부 도구/라이선스", unit: "만원/SI건", note: "상용 파서 별도 확정" },
  { key: "acquisition", label: "고객획득 직접비", unit: "만원/SI건", note: "제안/계약 관련 원가 가정" },
];

const pctf = (n: number) => `${(n * 100).toFixed(1)}%`;

export default function ProgramPage() {
  const mounted = useMounted();
  const a = useStore((s) => s.assumptions);
  const roles = useStore((s) => s.roles);
  const plan = useStore((s) => s.monthPlan);
  const wbsStatus = useStore((s) => s.wbsStatus);
  const setAssumptions = useStore((s) => s.setAssumptions);
  const setRoles = useStore((s) => s.setRoles);
  const setMonthPlan = useStore((s) => s.setMonthPlan);
  const resetWorkbook = useStore((s) => s.resetWorkbook);
  const setWbsStatus = useStore((s) => s.setWbsStatus);

  const q = useMemo(() => computeQuote(a, roles), [a, roles]);
  const cash = useMemo(() => computeCashflow(a, plan, q.plannedCost), [a, plan, q.plannedCost]);
  const marginOk = q.margin >= a.targetMargin;

  if (!mounted) return <div className="p-6 text-muted">불러오는 중…</div>;

  return (
    <div className="pb-10">
      <PageHeader
        title="사업 · 견적"
        sub={`${PRODUCT_NAME} — ${PRODUCT_TAGLINE}. 가격·목표·인력·일정은 사업설계 가정이며 시장단가·수주 약정이 아닙니다.`}
        right={<button className="btn" type="button" onClick={resetWorkbook}>워크북 초기값으로</button>}
      />
      <div className="px-6 space-y-3">
        <section className="card p-4">
          <div className="eyebrow">ONE SENTENCE</div>
          <p className="serif text-[15px] mt-1">“{ONE_SENTENCE}”</p>
          <p className="text-[12px] text-muted mt-2">{QUALIFICATION_RULE}</p>
        </section>

        <section className="card p-4">
          <div className="eyebrow">PRODUCTS</div>
          <h2 className="font-semibold mb-2">상품 4종 — 진단 → 파일럿 → SI 정비·연동 → 월간 운영</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {PRODUCTS.map((p) => (
              <div key={p.key} className={`border rounded-lg p-3 ${p.sellNow ? "border-accent" : "border-border"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">{p.name}</div>
                  <span className="chip">{p.sellNow ? "지금 판매" : "구축·검증 후"}</span>
                </div>
                <div className="mono text-[12px] mt-1">{p.price} · {p.duration}</div>
                <p className="text-[12px] text-muted mt-1">{p.scope}</p>
                <p className="text-[11px] text-muted mt-1">매출 성격: {p.revenueType}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] mt-3">{WORK_UNITS}</p>
          <p className="text-[12px] text-muted mt-1">제외 과업(별도 견적): {EXCLUDED_TASKS.join(" · ")}. 무료 예비상담을 무료 전수진단으로 확장하지 않는다. 모든 금액 VAT 제외.</p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1.2fr] gap-3">
          <div className="card p-4">
            <div className="eyebrow">ASSUMPTIONS</div>
            <h2 className="font-semibold mb-1">사업가정 (파란색 = 입력)</h2>
            <p className="text-[12px] text-muted mb-2">확정된 예산·임금·시장가격이 아니다. 공급사 견적과 고객 과업 확정 후 변경한다. 이 브라우저에만 저장된다.</p>
            <table className="tbl">
              <tbody>
                {ASSUMPTION_FIELDS.map((f) => (
                  <tr key={f.key}>
                    <td className="whitespace-nowrap">{f.label}</td>
                    <td className="w-28">
                      <input
                        className="input mono text-accent"
                        type="number"
                        step={f.step ?? 10}
                        value={a[f.key]}
                        onChange={(e) => setAssumptions({ [f.key]: Number(e.target.value) || 0 })}
                        aria-label={f.label}
                      />
                    </td>
                    <td className="text-[11px] text-muted whitespace-nowrap">{f.unit}</td>
                    <td className="text-[11px] text-muted">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3">
            <div className="card p-4">
              <div className="eyebrow">COST ESTIMATE</div>
              <h2 className="font-semibold mb-1">표준 SI 원가·견적 (역할별 인일 × 원가 단가)</h2>
              <p className="text-[12px] text-muted mb-2">단가 = 만원/인일 계획 원가(공식 노임단가 아님). 기관 검토 대기·별도 인증·대량 OCR 제외.</p>
              <table className="tbl">
                <thead><tr><th>역할</th><th>인일</th><th>단가</th><th>금액</th><th>범위</th></tr></thead>
                <tbody>
                  {roles.map((r, i) => (
                    <tr key={r.role}>
                      <td className="whitespace-nowrap">{r.role}</td>
                      <td className="w-20"><input className="input mono text-accent" type="number" min={0} value={r.days} onChange={(e) => setRoles(roles.map((x, j) => (j === i ? { ...x, days: Number(e.target.value) || 0 } : x)))} aria-label={`${r.role} 인일`} /></td>
                      <td className="w-20"><input className="input mono text-accent" type="number" min={0} value={r.rate} onChange={(e) => setRoles(roles.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) || 0 } : x)))} aria-label={`${r.role} 단가`} /></td>
                      <td className="mono">{(r.days * r.rate).toLocaleString()}</td>
                      <td className="text-[11px] text-muted">{r.scope}</td>
                    </tr>
                  ))}
                  <tr><td className="font-medium">총 투입 인일</td><td className="mono font-medium">{q.totalDays}</td><td></td><td className="mono font-medium">{q.labor.toLocaleString()}</td><td className="text-[11px] text-muted">직접 인건비 · 60근무일이면 평균 {q.avgHeadcount(60).toFixed(1)}명 상시 투입 상당</td></tr>
                </tbody>
              </table>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-[13px] mt-3">
                <dt className="text-muted">직접비 소계(인프라·출장·도구·획득 포함)</dt><dd className="mono">{fmtMan(q.directSubtotal)}</dd>
                <dt className="text-muted">예비비 {pctf(a.contingencyRatio)}</dt><dd className="mono">{fmtMan(q.contingency)}</dd>
                <dt className="text-muted">계획 프로젝트 총원가</dt><dd className="mono font-semibold">{fmtMan(q.plannedCost)}</dd>
                <dt className="text-muted">목표이익률 {pctf(a.targetMargin)} 최소 제안가</dt><dd className="mono">{fmtMan(q.minPriceForTarget)}</dd>
                <dt className="text-muted">제안금액(VAT 제외)</dt><dd className="mono font-semibold">{fmtMan(q.proposal)}</dd>
                <dt className="text-muted">계획 이익 / 이익률</dt><dd className={`mono ${marginOk ? "text-low" : "text-high"}`}>{fmtMan(q.profit)} / {pctf(q.margin)} {marginOk ? "✓" : "목표 미달"}</dd>
                <dt className="text-muted">VAT {pctf(a.vatRate)} / 견적 합계</dt><dd className="mono">{fmtMan(q.vat)} / {fmtMan(q.totalWithVat)}</dd>
              </dl>
              <p className="text-[11px] text-muted mt-2">단가 할인 전에는 정비 건수, CMS 연동 범위, 반복 검수 횟수부터 줄인다. 원가를 숨긴 채 “AI가 하니 저렴하다”는 논리로 가격을 정하지 않는다.</p>
            </div>
          </div>
        </section>

        <section className="card p-4">
          <div className="eyebrow">12-MONTH CASH</div>
          <h2 className="font-semibold mb-1">12개월 현금 시나리오 — 수주가 아니라 가정</h2>
          <p className="text-[12px] text-muted mb-2">청구액 = 해당 월 단가×건수, 수금은 다음 달 100%. 직접비는 청구 월 지급. 세금·대출·감가상각 제외. 손익·세무 결산표가 아니다.</p>
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-3">
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>월</th><th>진단</th><th>파일럿</th><th>SI</th><th>운영 고객</th><th>청구액</th><th>수금액</th><th>직접지출</th><th>공통비</th><th>투자</th><th>순현금</th><th>기말현금</th></tr></thead>
                <tbody>
                  {cash.rows.map((r, i) => (
                    <tr key={r.month} className={r.ending < 0 ? "text-high" : ""}>
                      <td className="mono">{r.month}</td>
                      {(["diagnose", "pilot", "si", "careClients"] as const).map((k) => (
                        <td key={k} className="w-16">
                          <input className="input mono text-accent px-1" type="number" min={0} value={r[k]} onChange={(e) => setMonthPlan(plan.map((p, j) => (j === i ? { ...p, [k]: Math.max(0, Number(e.target.value) || 0) } : p)))} aria-label={`${r.month}월 ${k}`} />
                        </td>
                      ))}
                      <td className="mono">{r.billed.toLocaleString()}</td>
                      <td className="mono">{r.collected.toLocaleString()}</td>
                      <td className="mono">{r.directSpend.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                      <td className="mono">{r.overhead}</td>
                      <td className="mono">{r.productInvest}</td>
                      <td className="mono">{r.net.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                      <td className="mono font-medium">{r.ending.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={5}>연간 합계 / 마지막 달 잔액</td>
                    <td className="mono">{cash.totalBilled.toLocaleString()}</td>
                    <td className="mono">{cash.totalCollected.toLocaleString()}</td>
                    <td className="mono">{cash.totalDirect.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                    <td className="mono">{cash.totalOverhead.toLocaleString()}</td>
                    <td className="mono">{cash.totalInvest.toLocaleString()}</td>
                    <td className="mono">{cash.totalNet.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                    <td className="mono">{cash.endingCash.toLocaleString(undefined, { maximumFractionDigits: 1 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cash.rows}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} />
                    <YAxis stroke="var(--muted)" fontSize={11} />
                    <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
                    <Bar dataKey="net" name="순현금" fill="var(--accent-soft)" stroke="var(--accent)" />
                    <Line type="monotone" dataKey="ending" name="기말현금" stroke="var(--high)" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px] mt-2">
                <dt className="text-muted">현금 최저점</dt><dd className={`mono ${cash.lowestCash < 0 ? "text-high" : ""}`}>{fmtMan(cash.lowestCash)}</dd>
                <dt className="text-muted">최소 추가자금(완충분 제외)</dt><dd className="mono font-semibold">{fmtMan(cash.minAdditionalFunding)}</dd>
                <dt className="text-muted">연말 미수금(다음 해 회수)</dt><dd className="mono">{fmtMan(cash.yearEndReceivable)}</dd>
              </dl>
              <p className="text-[11px] text-muted mt-2">실제 필요자금은 위 값에 세금·선투입·회수 지연·안전 완충분을 더한다. 수금 지연 1~2개월, 추가 검수 20%, SI 1건 미수주를 별도 시나리오로 계산한 뒤 채용·외주를 결정한다.</p>
            </div>
          </div>
          <div className="h-36 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cash.rows}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="var(--muted)" fontSize={11} />
                <YAxis stroke="var(--muted)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", fontSize: 12 }} />
                <Bar dataKey="billed" name="청구액" fill="var(--sky)" />
                <Bar dataKey="collected" name="수금액" fill="var(--low)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card p-4">
          <div className="eyebrow">90-DAY WBS</div>
          <h2 className="font-semibold mb-1">90일 작업계획 — 영업과 제품화를 함께</h2>
          <p className="text-[12px] text-muted mb-2">주차는 계약·기관 검토 지연이 없는 가정. 공공 조달 완료를 90일로 보장하지 않는다. 상태는 이 브라우저에 저장된다.</p>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>ID</th><th>작업</th><th>책임</th><th>주차</th><th>선행 / 조건</th><th>완료 산출물</th><th>상태</th></tr></thead>
              <tbody>
                {WBS.map((w) => (
                  <tr key={w.id}>
                    <td className="mono">{w.id}</td>
                    <td>{w.task} {w.extra && <span className="chip ml-1">추가 구축</span>}</td>
                    <td className="text-[12px]">{w.owner}</td>
                    <td className="mono whitespace-nowrap">
                      <span className="inline-block align-middle w-24 h-2 rounded bg-background mr-2 relative" aria-hidden>
                        <span className="absolute h-full rounded bg-accent" style={{ left: `${((w.start - 1) / 13) * 100}%`, width: `${((w.end - w.start + 1) / 13) * 100}%` }} />
                      </span>
                      {w.start}~{w.end}
                    </td>
                    <td className="text-[12px]">{w.precondition}</td>
                    <td className="text-[12px]">{w.extra ? "미구현: " : ""}{w.deliverable}</td>
                    <td>
                      <select className="input" value={wbsStatus[w.id] ?? "미착수"} onChange={(e) => setWbsStatus(w.id, e.target.value as (typeof WBS_STATUSES)[number])} aria-label={`${w.id} 상태`}>
                        {WBS_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card p-4">
          <div className="eyebrow">PROCESS</div>
          <h2 className="font-semibold mb-1">전체 수행 프로세스 12단계 — 확인·승인·반영·검증은 서로 다른 작업</h2>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>단계</th><th>책임</th><th>입력·수행</th><th>산출물 / 통과 조건</th></tr></thead>
              <tbody>
                {PROCESS_STEPS.map((p) => (
                  <tr key={p.no}>
                    <td className="whitespace-nowrap font-medium">{p.no}</td>
                    <td className="text-[12px] whitespace-nowrap">{p.owner}</td>
                    <td className="text-[12px]">{p.doing}</td>
                    <td className="text-[12px]">{p.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
