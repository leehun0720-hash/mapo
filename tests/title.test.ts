import { describe, expect, it } from "vitest";
import { checkTitle, findMassShared, suggestTitle } from "@/lib/title";

const base = {
  breadcrumb: ["민원", "주택/건축 민원"],
  isHome: false,
  siteDefaultTitle: "마포구청 | 대표사이트",
};

describe("D2 title 규칙", () => {
  it("T1 누락", () => {
    expect(checkTitle({ ...base, title: "  ", h1: "주택/건축 민원" }).code).toBe("D2_T1_MISSING");
  });
  it("T2 사이트 기본 title", () => {
    expect(checkTitle({ ...base, title: "마포구청 | 대표사이트", h1: "주택/건축 민원" }).code).toBe(
      "D2_T2_SITE_DEFAULT",
    );
    expect(
      checkTitle({ ...base, isHome: true, title: "마포구청 | 대표사이트", h1: "마포구청" }).code,
    ).toBeNull();
  });
  it("T4 h1 불일치 (F3: 민원실 종합안내)", () => {
    expect(checkTitle({ ...base, title: "민원실 종합안내 | 마포구청", h1: "주택/건축 민원" }).code).toBe(
      "D2_T4_H1_MISMATCH",
    );
    expect(
      checkTitle({ ...base, title: "주택/건축 민원 | 민원 | 마포구청", h1: "주택/건축 민원" }).code,
    ).toBeNull();
  });
  it("T3 title 값당 1건", () => {
    const docs = Array.from({ length: 12 }, (_, i) => ({
      docId: i,
      title: "마포구청 | 대표사이트",
      h1: `페이지 ${i}`,
    }));
    const r = findMassShared(docs, 10);
    expect(r).toHaveLength(1);
    expect(r[0].docIds).toHaveLength(12);
  });
  it("제안 title 형식", () => {
    expect(suggestTitle("주택/건축 민원", "민원", "마포구청")).toBe("주택/건축 민원 | 민원 | 마포구청");
  });
});
