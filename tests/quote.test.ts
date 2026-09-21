import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS, DEFAULT_MONTH_PLAN, DEFAULT_ROLES, computeCashflow, computeQuote } from "@/lib/quote";

// 기대값은 첨부 워크북(사업운영_견적.xlsx)의 계산 결과와 일치해야 한다.
describe("원가견적 시트", () => {
  const q = computeQuote(DEFAULT_ASSUMPTIONS, DEFAULT_ROLES);
  it("113인일 · 직접 인건비 4,264", () => {
    expect(q.totalDays).toBe(113);
    expect(q.labor).toBe(4264);
  });
  it("예비비 전 소계 4,724 · 예비비 472.4 · 계획 총원가 5,196.4", () => {
    expect(q.directSubtotal).toBe(4724);
    expect(q.contingency).toBeCloseTo(472.4, 6);
    expect(q.plannedCost).toBeCloseTo(5196.4, 6);
  });
  it("목표이익률 30% 최소가 ≈ 7,423.4 · 제안 8,000 → 이익 2,803.6 (35.0%) · VAT 포함 8,800", () => {
    expect(q.minPriceForTarget).toBeCloseTo(7423.428571, 4);
    expect(q.profit).toBeCloseTo(2803.6, 6);
    expect(q.margin).toBeCloseTo(0.35045, 5);
    expect(q.totalWithVat).toBe(8800);
  });
  it("60근무일 기준 평균 약 1.9명 상시 투입", () => {
    expect(q.avgHeadcount(60)).toBeCloseTo(1.883, 2);
  });
});

describe("12개월현금 시트", () => {
  const q = computeQuote(DEFAULT_ASSUMPTIONS, DEFAULT_ROLES);
  const c = computeCashflow(DEFAULT_ASSUMPTIONS, DEFAULT_MONTH_PLAN, q.plannedCost);
  it("월별 기말현금이 워크북과 일치", () => {
    const ending = c.rows.map((r) => Math.round(r.ending * 10) / 10);
    expect(ending).toEqual([2500, 1340, 2040, -735, 1605, 2305, -3391.4, 3298.6, 1823.6, 4773.6, 3813.6, -482.8]);
  });
  it("연간 합계: 청구 29,800 · 수금 21,300 · 직접지출 18,782.8 · 공통비 6,000 · 투자 2,000", () => {
    expect(c.totalBilled).toBe(29800);
    expect(c.totalCollected).toBe(21300);
    expect(c.totalDirect).toBeCloseTo(18782.8, 6);
    expect(c.totalOverhead).toBe(6000);
    expect(c.totalInvest).toBe(2000);
  });
  it("현금 최저점 −3,391.4 · 최소 추가자금 3,391.4 · 연말 미수금 8,500", () => {
    expect(c.lowestCash).toBeCloseTo(-3391.4, 6);
    expect(c.minAdditionalFunding).toBeCloseTo(3391.4, 6);
    expect(c.yearEndReceivable).toBe(8500);
  });
});
