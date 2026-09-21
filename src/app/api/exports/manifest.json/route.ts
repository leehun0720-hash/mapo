import { NextResponse, type NextRequest } from "next/server";
import { ISSUES } from "@/data/issues";
import { buildManifest } from "@/lib/exports";

// GET /exports/manifest.json — 벤더 토큰은 이것만 접근 (구성명세서 9장).
// VENDOR_TOKEN 환경변수를 두면 Bearer 토큰을 검사하고, 없으면 시연용으로 공개한다.
export function GET(req: NextRequest) {
  const required = process.env.VENDOR_TOKEN;
  if (required) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${required}`) return NextResponse.json({ error: "vendor token required" }, { status: 401 });
  }
  const manifest = buildManifest(ISSUES, {}, true);
  return NextResponse.json(manifest, { headers: { "Cache-Control": "no-store" } });
}
