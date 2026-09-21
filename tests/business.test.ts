import { describe, expect, it } from "vitest";
import { ISSUES } from "@/data/issues";
import { DOCS, docById } from "@/data/docs";
import { buildManifest, knowledgeJsonl, listConflicts, protectCell, redirectMapCsv, versionConflict } from "@/lib/exports";
import { ticketRows } from "@/lib/tickets";
import { REQUIREMENTS, OPEN_GATES, RISKS, INTERVIEW, WBS } from "@/data/business";

describe("REQ07 승인 후 원문 변경 → 적용 거부", () => {
  const f1 = ISSUES.find((i) => i.fixtureId === "F1")!;
  it("F1은 v2 기준 승인, 현재 문서 v3 → 충돌", () => {
    expect(docById(101)!.version).toBe(3);
    expect(versionConflict(f1)).toEqual({ base: 2, current: 3 });
    expect(listConflicts(ISSUES)).toHaveLength(1);
  });
  it("충돌 이슈는 리다이렉트 맵·수정 요청서·title_override에서 빠진다", () => {
    expect(redirectMapCsv(ISSUES).split("\r\n").filter(Boolean)).toHaveLength(1); // 헤더만
    expect(ticketRows(ISSUES).some((r) => r.URL.includes("passport_reissue"))).toBe(false);
    const fixed = ISSUES.map((i) => (i.fixtureId === "F1" ? { ...i, approvedBaseVersion: 3 } : i));
    expect(redirectMapCsv(fixed).split("\r\n").filter(Boolean)).toHaveLength(5);
  });
});

describe("REQ16 CSV 수식 보호", () => {
  it("=, +, -, @ 로 시작하는 셀은 작은따옴표를 앞에 붙인다", () => {
    expect(protectCell("=HYPERLINK(\"x\")")).toBe("'=HYPERLINK(\"x\")");
    expect(protectCell("+1")).toBe("'+1");
    expect(protectCell("-5")).toBe("'-5");
    expect(protectCell("@cmd")).toBe("'@cmd");
    expect(protectCell("정상 텍스트")).toBe("정상 텍스트");
  });
});

describe("승인 지식 JSONL", () => {
  const m = buildManifest(ISSUES, {}, true);
  const lines = knowledgeJsonl(ISSUES, m).split("\n").filter(Boolean).map((l) => JSON.parse(l));
  it("include 문서만, PII·보존 기록·만료 제외", () => {
    expect(lines.length).toBeGreaterThan(0);
    for (const l of lines) {
      if (l.kind === "fact") continue;
      const d = docById(l.doc_id)!;
      expect(d.personalDataFlag).not.toBe(true);
      expect(d.recordStatus).not.toBe("archive");
      expect(m.documents.find((x) => x.doc_id === l.doc_id)!.index).toBe("include");
    }
    expect(lines.some((l) => l.doc_id === 181)).toBe(false); // PII 첨부 공고
    expect(lines.some((l) => l.doc_id === 134)).toBe(false); // 보존 기록
  });
  it("책임자 미입력 문서는 hold", () => {
    expect(m.documents.find((d) => d.doc_id === 212)!.index).toBe("hold");
    expect(m.documents.find((d) => d.doc_id === 212)!.reason_codes).toContain("OWNER_MISSING");
  });
});

describe("워크북 데이터 무결성", () => {
  it("REQ 16 · 관문 9 · 위험 10 · 인터뷰 10 · WBS 14", () => {
    expect(REQUIREMENTS).toHaveLength(16);
    expect(OPEN_GATES).toHaveLength(9);
    expect(RISKS).toHaveLength(10);
    expect(INTERVIEW).toHaveLength(10);
    expect(WBS).toHaveLength(14);
    expect(WBS.filter((w) => w.extra).map((w) => w.id)).toEqual(["W09", "W10", "W11"]);
  });
  it("모든 문서에 버전이 있고 D9·D3_OWNER_MISSING 표본이 있다", () => {
    for (const d of DOCS) expect(d.version).toBeGreaterThanOrEqual(1);
    expect(ISSUES.some((i) => i.code === "D9_INJECTION")).toBe(true);
    expect(ISSUES.some((i) => i.code === "D3_OWNER_MISSING")).toBe(true);
  });
});
