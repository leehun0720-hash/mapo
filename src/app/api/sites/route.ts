import { NextResponse } from "next/server";
import { SITES } from "@/data/sites";
import { SITE_PROBLEM_DOCS } from "@/data/kpi";
import { siteScore } from "@/lib/score";

// GET /sites — 사이트 목록·위생 점수 (구성명세서 9장)
export function GET() {
  return NextResponse.json({
    sites: SITES.map((s) => ({
      ...s,
      score: siteScore({ docCount: s.docCount, problemDocs: SITE_PROBLEM_DOCS[s.siteId] }),
    })),
  });
}
