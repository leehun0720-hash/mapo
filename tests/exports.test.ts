import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { ISSUES } from "@/data/issues";
import { DOCS } from "@/data/docs";
import { buildManifest, canonicalMapCsv, redirectMapCsv, sitemapXml, titleFixesCsv } from "@/lib/exports";
import { buildTicketsWorkbook, sheetName, ticketRows } from "@/lib/tickets";

const rows = (csv: string) => csv.replace(/^﻿/, "").split("\r\n").slice(1).filter(Boolean);

describe("6.6 내보내기", () => {
  it("매니페스트 스키마: 모든 문서가 include|exclude|hold, 비대표 사본은 exclude", () => {
    const m = buildManifest(ISSUES, {}, true);
    expect(m.manifest_version).toBe("1.0");
    expect(m.documents).toHaveLength(DOCS.length);
    for (const d of m.documents) expect(["include", "exclude", "hold"]).toContain(d.index);
    const copy = m.documents.find((d) => d.doc_id === 102)!;
    expect(copy.index).toBe("exclude");
    expect(copy.reason_codes).toContain("NON_CANONICAL");
    // 개인정보 미해결 문서는 승인 없이 exclude(PII)
    expect(m.documents.find((d) => d.doc_id === 181)!.reason_codes).toContain("PII");
  });
  it("대표 URL을 사람이 바꾸면 매니페스트·canonical 맵이 따라간다", () => {
    const m = buildManifest(ISSUES, { 1: { docId: 103 } }, true);
    expect(m.documents.find((d) => d.doc_id === 103)!.index).toBe("include");
    expect(m.documents.find((d) => d.doc_id === 101)!.index).toBe("exclude");
    const cm = rows(canonicalMapCsv({ 1: { docId: 103 } }));
    expect(cm.filter((r) => r.split(",")[0].includes("mangwon1.mapo.go.kr/site/main/content/passport_reissue"))).toHaveLength(0);
    expect(cm.filter((r) => r.startsWith("https://www.mapo.go.kr/site/main/content/passport_reissue,"))).toHaveLength(1);
  });
  it("canonical·redirect 맵에 같은 alias가 두 번 나오지 않는다", () => {
    const cm = rows(canonicalMapCsv());
    expect(new Set(cm.map((r) => r.split(",")[0])).size).toBe(cm.length);
    const rm = rows(redirectMapCsv(ISSUES)); // F1은 표본에서 approved
    expect(rm).toHaveLength(4);
    expect(new Set(rm.map((r) => r.split(",")[0])).size).toBe(4);
  });
  it("title_fixes는 승인된 D2만, 템플릿 이슈는 관련 문서로 펼친다", () => {
    const approved = ISSUES.map((i) => (i.code === "D2_T3_MASS_SHARED" ? { ...i, status: "approved" as const } : i));
    const tf = rows(titleFixesCsv(approved));
    expect(tf).toHaveLength(12);
    expect(tf[1]).toContain("노인일자리 사업 안내 | 어르신 포털 | 마포구청");
  });
  it("sitemap은 include 문서만", () => {
    const m = buildManifest(ISSUES, {}, true);
    const xml = sitemapXml(m);
    expect((xml.match(/<url>/g) ?? []).length).toBe(m.documents.filter((d) => d.index === "include").length);
  });
});

describe("tickets.xlsx", () => {
  it("시트명 31자 제한·금지 문자 치환", () => {
    expect(sheetName("주택/건축과")).toBe("주택_건축과");
    expect(sheetName("가".repeat(40))).toHaveLength(31);
  });
  it("승인된 이슈만 담고, 요약·전체·부서별·용어설명 시트가 있다", () => {
    const approved = ISSUES.map((i, k) => (k < 6 ? { ...i, status: "approved" as const } : i));
    const r = ticketRows(approved);
    expect(r).toHaveLength(6);
    expect(Object.keys(r[0])).toContain("무엇이 문제인가");
    const blob = buildTicketsWorkbook(approved);
    expect(blob.size).toBeGreaterThan(1000);
  });
  it("워크북을 다시 읽으면 부서 시트가 생성돼 있다", async () => {
    const approved = ISSUES.map((i, k) => (k < 6 ? { ...i, status: "approved" as const } : i));
    const buf = await buildTicketsWorkbook(approved).arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    expect(wb.SheetNames[0]).toBe("요약");
    expect(wb.SheetNames).toContain("전체");
    expect(wb.SheetNames).toContain("용어설명");
    expect(wb.SheetNames).toContain("민원여권과");
    const all = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets["전체"]);
    expect(all).toHaveLength(6);
  });
});
