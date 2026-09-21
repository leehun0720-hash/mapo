import { NextResponse, type NextRequest } from "next/server";
import { ISSUES } from "@/data/issues";
import { buildManifest, kpiJson } from "@/lib/exports";
import { KPI_SERIES } from "@/data/kpi";

// GET /kpi?from=&to= — KPI 시계열
export function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") ?? "0000-00-00";
  const to = req.nextUrl.searchParams.get("to") ?? "9999-99-99";
  const k = kpiJson(ISSUES, buildManifest(ISSUES, {}, true));
  return NextResponse.json({ ...k, series: KPI_SERIES.filter((p) => p.date >= from && p.date <= to) });
}
