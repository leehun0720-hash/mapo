// 견적·현금 계산 — 「TenAI_ContentCare_사업운영_견적.xlsx」의 원가견적·12개월현금 시트 산식을 그대로 옮김.
// 금액 단위: 만원, VAT 제외. 확정 예산·임금·시장가격이 아니라 계획 가정이다.

export interface Assumptions {
  diagnosePrice: number; // 진단 계약 단가 (만원/건)
  pilotPrice: number; // 파일럿 계약 단가
  siPrice: number; // SI 제안금액
  careMonthly: number; // 월 운영료 (만원/기관)
  diagnoseDirectRatio: number; // 진단 직접비율
  pilotDirectRatio: number;
  careDirectRatio: number;
  contingencyRatio: number; // 예비비율 (직접비 기준)
  targetMargin: number; // 목표 프로젝트 이익률 (제안금액 대비)
  vatRate: number;
  startingCash: number; // 시작 현금
  monthlyOverhead: number; // 월 공통 운영비
  initialProductInvest: number; // 초기 공통 제품개발 투자 (1개월차)
  infraApi: number; // 인프라/API (만원/SI건)
  travelTraining: number; // 출장/교육
  toolsLicense: number; // 외부 도구/라이선스
  acquisition: number; // 고객획득 직접비
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  diagnosePrice: 1200,
  pilotPrice: 3500,
  siPrice: 8000,
  careMonthly: 250,
  diagnoseDirectRatio: 0.55,
  pilotDirectRatio: 0.65,
  careDirectRatio: 0.6,
  contingencyRatio: 0.1,
  targetMargin: 0.3,
  vatRate: 0.1,
  startingCash: 5000,
  monthlyOverhead: 500,
  initialProductInvest: 2000,
  infraApi: 140,
  travelTraining: 60,
  toolsLicense: 60,
  acquisition: 200,
};

export interface CostRole {
  role: string;
  days: number; // 인일
  rate: number; // 원가 단가 (만원/인일, 계획 원가 — 공식 노임단가 아님)
  scope: string;
}

export const DEFAULT_ROLES: CostRole[] = [
  { role: "PM/업무설계", days: 15, rate: 45, scope: "요구사항·범위·주간회의·납품" },
  { role: "백엔드/연동", days: 28, rate: 40, scope: "API·승인·저장·작업관리" },
  { role: "프런트엔드", days: 18, rate: 38, scope: "운영 UI·반응형·접근성 보완" },
  { role: "콘텐츠 정비", days: 25, rate: 30, scope: "표본 검수·정본 결정 지원·수정" },
  { role: "QA/평가", days: 12, rate: 30, scope: "회귀·평가셋·사용자 인수시험" },
  { role: "보안 전문가", days: 5, rate: 55, scope: "기관 요건 검토·위협모델·점검" },
  { role: "CMS 협력사", days: 10, rate: 40, scope: "어댑터·템플릿·복구 검증" },
];

export interface Quote {
  totalDays: number;
  labor: number; // 직접 인건비
  directSubtotal: number; // 예비비 전 소계
  contingency: number; // 예비비
  plannedCost: number; // 계획 프로젝트 총원가
  minPriceForTarget: number; // 목표이익률 충족 최소가
  proposal: number; // 제안금액 (VAT 제외)
  profit: number; // 계획 프로젝트 이익
  margin: number; // 계획 프로젝트 이익률
  vat: number;
  totalWithVat: number;
  avgHeadcount: (workdays: number) => number; // 60근무일 기준 평균 상시 투입 상당
}

export function computeQuote(a: Assumptions, roles: CostRole[]): Quote {
  const totalDays = roles.reduce((s, r) => s + r.days, 0);
  const labor = roles.reduce((s, r) => s + r.days * r.rate, 0);
  const directSubtotal = labor + a.infraApi + a.travelTraining + a.toolsLicense + a.acquisition;
  const contingency = directSubtotal * a.contingencyRatio;
  const plannedCost = directSubtotal + contingency;
  const minPriceForTarget = a.targetMargin < 1 ? plannedCost / (1 - a.targetMargin) : Infinity;
  const proposal = a.siPrice;
  const profit = proposal - plannedCost;
  const margin = proposal > 0 ? profit / proposal : 0;
  const vat = proposal * a.vatRate;
  return {
    totalDays,
    labor,
    directSubtotal,
    contingency,
    plannedCost,
    minPriceForTarget,
    proposal,
    profit,
    margin,
    vat,
    totalWithVat: proposal + vat,
    avgHeadcount: (workdays) => totalDays / workdays,
  };
}

/** 월별 청구 계획 — 12개월현금 시트의 파란색 입력 */
export interface MonthPlan {
  month: number;
  diagnose: number; // 진단 청구건
  pilot: number; // 파일럿 청구건
  si: number; // SI 청구건
  careClients: number; // 운영 고객 수
}

export const DEFAULT_MONTH_PLAN: MonthPlan[] = [
  { month: 1, diagnose: 0, pilot: 0, si: 0, careClients: 0 },
  { month: 2, diagnose: 1, pilot: 0, si: 0, careClients: 0 },
  { month: 3, diagnose: 0, pilot: 0, si: 0, careClients: 0 },
  { month: 4, diagnose: 0, pilot: 1, si: 0, careClients: 0 },
  { month: 5, diagnose: 1, pilot: 0, si: 0, careClients: 0 },
  { month: 6, diagnose: 0, pilot: 0, si: 0, careClients: 0 },
  { month: 7, diagnose: 0, pilot: 0, si: 1, careClients: 0 },
  { month: 8, diagnose: 1, pilot: 0, si: 0, careClients: 1 },
  { month: 9, diagnose: 0, pilot: 1, si: 0, careClients: 1 },
  { month: 10, diagnose: 0, pilot: 0, si: 0, careClients: 2 },
  { month: 11, diagnose: 1, pilot: 0, si: 0, careClients: 2 },
  { month: 12, diagnose: 0, pilot: 0, si: 1, careClients: 2 },
];

export interface CashRow extends MonthPlan {
  billed: number; // 청구액
  collected: number; // 수금액 (다음 달 100% 가정)
  directSpend: number; // 직접지출 (청구 월 지급)
  overhead: number;
  productInvest: number;
  net: number; // 순현금
  ending: number; // 기말현금
}

export interface Cashflow {
  rows: CashRow[];
  totalBilled: number;
  totalCollected: number;
  totalDirect: number;
  totalOverhead: number;
  totalInvest: number;
  totalNet: number;
  endingCash: number;
  lowestCash: number;
  minAdditionalFunding: number; // 완충분 제외
  yearEndReceivable: number; // 연말 미수금 (다음 해 회수)
}

/**
 * 청구액 = 진단·파일럿·SI 단가×건수 + 운영료×고객수. 수금은 다음 달 100%.
 * 직접지출 = 진단·파일럿은 단가×직접비율, SI는 계획 총원가, 운영은 운영료×직접비율.
 */
export function computeCashflow(a: Assumptions, plan: MonthPlan[], siPlannedCost: number): Cashflow {
  const rows: CashRow[] = [];
  let ending = a.startingCash;
  let prevBilled = 0;
  let lowest = Infinity;
  for (const p of plan) {
    const billed = p.diagnose * a.diagnosePrice + p.pilot * a.pilotPrice + p.si * a.siPrice + p.careClients * a.careMonthly;
    const collected = prevBilled;
    const directSpend =
      p.diagnose * a.diagnosePrice * a.diagnoseDirectRatio +
      p.pilot * a.pilotPrice * a.pilotDirectRatio +
      p.si * siPlannedCost +
      p.careClients * a.careMonthly * a.careDirectRatio;
    const overhead = a.monthlyOverhead;
    const productInvest = p.month === 1 ? a.initialProductInvest : 0;
    const net = collected - directSpend - overhead - productInvest;
    ending += net;
    lowest = Math.min(lowest, ending);
    rows.push({ ...p, billed, collected, directSpend, overhead, productInvest, net, ending });
    prevBilled = billed;
  }
  const sum = (k: keyof CashRow) => rows.reduce((s, r) => s + (r[k] as number), 0);
  return {
    rows,
    totalBilled: sum("billed"),
    totalCollected: sum("collected"),
    totalDirect: sum("directSpend"),
    totalOverhead: sum("overhead"),
    totalInvest: sum("productInvest"),
    totalNet: sum("net"),
    endingCash: ending,
    lowestCash: lowest,
    minAdditionalFunding: Math.max(0, -lowest),
    yearEndReceivable: prevBilled,
  };
}

export const fmtMan = (n: number, digits = 1) =>
  `${Number.isFinite(n) ? n.toLocaleString("ko-KR", { maximumFractionDigits: digits }) : "∞"}만원`;
