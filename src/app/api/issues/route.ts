import { NextResponse, type NextRequest } from "next/server";
import { ISSUES } from "@/data/issues";
import { docById } from "@/data/docs";

// GET /issues?detector=&code=&severity=&department=&status=&grade=&q=&page=&size=
// 서버리스 배포에는 DB가 없으므로 기본 표본만 응답한다. 승인 상태는 브라우저 저장소에 있다.
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const q = (p.get("q") ?? "").toLowerCase();
  const page = Math.max(1, Number(p.get("page") ?? 1));
  const size = Math.min(200, Math.max(1, Number(p.get("size") ?? 50)));
  const list = ISSUES.filter((i) => {
    for (const k of ["detector", "code", "severity", "department", "status", "grade"] as const) {
      const v = p.get(k);
      if (v && i[k] !== v) return false;
    }
    if (q) {
      const d = docById(i.docId);
      if (![i.code, i.department, d?.title, d?.h1, d?.canonicalUrl].join(" ").toLowerCase().includes(q)) return false;
    }
    return true;
  });
  return NextResponse.json({
    total: list.length,
    page,
    size,
    items: list.slice((page - 1) * size, page * size).map((i) => ({ ...i, doc: docById(i.docId) ?? null })),
  });
}
