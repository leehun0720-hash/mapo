"use client";

import { useMounted } from "@/lib/useMounted";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIssues, useStore } from "@/store/useStore";
import { CURRENT_RUN, RUNS } from "@/data/kpi";

const ITEMS = [
  { href: "/", label: "대시보드", key: "1" },
  { href: "/issues", label: "이슈 큐", key: "2" },
  { href: "/clusters", label: "중복 클러스터", key: "3" },
  { href: "/rules", label: "규칙 편집", key: "4" },
  { href: "/exports", label: "내보내기", key: "5" },
  { href: "/tools", label: "검사 도구", key: "6" },
];

export function Nav() {
  const path = usePathname();
  const issues = useIssues();
  const reviewer = useStore((s) => s.reviewer);
  const setReviewer = useStore((s) => s.setReviewer);
  const mounted = useMounted();
  const open = issues.filter((i) => i.status === "open" || i.status === "regressed").length;
  const critical = issues.filter((i) => i.severity === "critical" && i.status === "open").length;
  const run = RUNS.find((r) => r.runId === CURRENT_RUN);

  return (
    <aside className="w-full lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col lg:sticky lg:top-0 lg:h-screen">
      <div className="px-4 py-4 border-b border-border">
        <div className="text-[11px] text-muted tracking-wide">마포구청 · 콘텐츠 건강검진</div>
        <div className="font-semibold text-[15px] leading-tight mt-0.5">콘텐츠 위생관리</div>
      </div>
      <nav className="p-2 lg:flex-1 flex lg:flex-col gap-1 lg:gap-0 overflow-x-auto" aria-label="주 메뉴">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 lg:justify-between px-3 py-2 rounded-md text-[13px] lg:mb-0.5 whitespace-nowrap ${
                active ? "bg-accent-soft text-accent font-medium" : "hover:bg-background"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span>{it.label}</span>
              {it.href === "/issues" && mounted && open > 0 && (
                <span className="text-[11px] rounded-full px-1.5 bg-background border border-border" aria-label={`대기 ${open}건`}>
                  {open}
                </span>
              )}
            </Link>
          );
        })}
        {mounted && critical > 0 && (
          <div className="mx-2 lg:mt-3 p-2 rounded-md border border-critical/40 text-[12px] text-critical whitespace-nowrap self-center lg:self-auto" role="alert">
            개인정보 긴급 이슈 {critical}건 — 즉시 조치
          </div>
        )}
      </nav>
      <div className="hidden lg:block p-3 border-t border-border text-[12px] text-muted space-y-2">
        <label className="block">
          <span className="block mb-1">승인자</span>
          <input
            className="input"
            value={mounted ? reviewer : ""}
            onChange={(e) => setReviewer(e.target.value)}
            aria-label="승인자 이름"
          />
        </label>
        {run && (
          <div>
            최근 실행 #{run.runId} ({run.kind})<br />
            {run.finishedAt?.slice(0, 16).replace("T", " ")}
          </div>
        )}
        <div className="text-[11px]">시연용 표본 데이터 · 읽기 전용 원칙</div>
      </div>
    </aside>
  );
}
