// 수정 요청서 tickets.xlsx — 받는 사람은 비개발자. 시트: 요약, 전체, 부서별, 용어설명 (구성명세서 6.6)
import * as XLSX from "xlsx";
import type { Issue } from "@/lib/types";
import { docById } from "@/data/docs";
import { DETECTOR_NAMES, ISSUE_MESSAGES, SEVERITY_LABEL } from "@/data/messages";
import { approvedAndValid, protectCell } from "@/lib/exports";

/** 시트명 31자 제한·금지 문자 치환 */
export function sheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, "_").trim() || "부서";
  return cleaned.length > 31 ? cleaned.slice(0, 31) : cleaned;
}

const DUE_DAYS: Record<string, number> = { critical: 1, high: 14, medium: 30, low: 60 };

function dueDate(sev: string): string {
  const d = new Date();
  d.setDate(d.getDate() + (DUE_DAYS[sev] ?? 30));
  return d.toISOString().slice(0, 10);
}

export function ticketRows(issues: Issue[]) {
  const approved = issues.filter((i) => approvedAndValid(i));
  return approved.map((i, idx) => {
    const doc = docById(i.docId);
    const msg = ISSUE_MESSAGES[i.code];
    const evidence = i.evidence.excerpt ?? i.evidence.values?.map((v) => `${v.value} ← ${v.url}`).join(" / ") ?? "";
    return {
      번호: idx + 1,
      심각도: SEVERITY_LABEL[i.severity],
      유형: `${DETECTOR_NAMES[i.detector]} · ${msg?.label ?? i.code}`,
      "페이지 제목": protectCell(doc?.title ?? doc?.h1 ?? "(제목 없음)"),
      URL: doc?.canonicalUrl ?? "",
      "무엇이 문제인가": msg?.what ?? "",
      근거: protectCell(evidence),
      "이렇게 고쳐 주세요": protectCell([msg?.fix, i.suggestion?.text, i.suggestion?.newTitle ? `제안 제목: ${i.suggestion.newTitle}` : null].filter(Boolean).join(" ")),
      "처리 기한": dueDate(i.severity),
      "처리 결과(부서 기입)": "",
      비고: [i.suggestion?.aiDraft ? "AI 초안 포함 — 게시 전 확인" : null, i.fixtureId ? `회귀 사례 ${i.fixtureId}` : null].filter(Boolean).join(", "),
      부서: i.department,
    };
  });
}

export function buildTicketsWorkbook(issues: Issue[]): Blob {
  const rows = ticketRows(issues);
  const wb = XLSX.utils.book_new();

  const byDept = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!byDept.has(r.부서)) byDept.set(r.부서, []);
    byDept.get(r.부서)!.push(r);
  }
  const summary = [
    ["마포구청 홈페이지 콘텐츠 수정 요청서"],
    ["생성일", new Date().toISOString().slice(0, 10)],
    ["총 건수", rows.length],
    [],
    ["부서", "건수", "긴급", "높음", "보통", "낮음"],
    ...[...byDept.entries()].map(([dept, list]) => [
      dept,
      list.length,
      list.filter((x) => x.심각도 === "긴급").length,
      list.filter((x) => x.심각도 === "높음").length,
      list.filter((x) => x.심각도 === "보통").length,
      list.filter((x) => x.심각도 === "낮음").length,
    ]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), "요약");

  const strip = (r: (typeof rows)[number]) => {
    const { 부서, ...rest } = r;
    return { ...rest, 담당부서: 부서 };
  };
  const all = XLSX.utils.json_to_sheet(rows.map(strip));
  all["!cols"] = [4, 6, 22, 30, 45, 50, 40, 50, 11, 18, 22, 12].map((w) => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, all, "전체");

  const used = new Set(["요약", "전체", "용어설명"]);
  for (const [dept, list] of byDept) {
    let name = sheetName(dept);
    let n = 2;
    while (used.has(name)) name = sheetName(`${dept}_${n++}`);
    used.add(name);
    const ws = XLSX.utils.json_to_sheet(list.map(strip));
    ws["!cols"] = all["!cols"];
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  const glossary = [
    ["용어", "뜻"],
    ["브라우저 제목(title)", "브라우저 탭과 검색 결과에 보이는 페이지 제목"],
    ["대표 주소(canonical)", "같은 내용의 여러 주소 중 검색엔진·AI에 알려 줄 하나의 주소"],
    ["301 리다이렉트", "옛 주소로 들어오면 새 주소로 자동으로 보내는 설정"],
    ["보관(아카이브)", "삭제하지 않고 '지난 자료'로 표시한 뒤 검색·AI 색인에서만 빼는 것"],
    ["색인 제외", "검색엔진과 AI 챗봇이 이 페이지를 읽지 않도록 하는 것. 페이지는 그대로 남음"],
    ["AI 초안", "AI가 만든 제안. 원문 근거가 붙어 있으며 사람이 확인한 뒤에만 반영"],
    ["회귀 사례", "2026-09-12 강의안에서 관찰된 문제로, 고쳐진 뒤 재발하는지 계속 확인하는 항목"],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(glossary), "용어설명");

  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}
