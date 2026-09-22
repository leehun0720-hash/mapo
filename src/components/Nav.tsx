"use client";

import { useMounted } from "@/lib/useMounted";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIssues, useStore } from "@/store/useStore";
import { CURRENT_RUN, RUNS } from "@/data/kpi";
import { HANDBOOK_LINKS } from "@/data/handbook";
import { ThemeToggle } from "@/components/ThemeToggle";

const ITEMS = [
  { href: "/", label: "업무 현황", no: "01" },
  { href: "/issues", label: "검토·승인", no: "02" },
  { href: "/clusters", label: "중복 문서 관리", no: "03" },
  { href: "/rules", label: "점검 기준 설정", no: "04" },
  { href: "/exports", label: "결과 내려받기", no: "05" },
  { href: "/tools", label: "검사 도구", no: "06" },
  { href: "/program", label: "사업 · 견적", no: "07" },
  { href: "/readiness", label: "운영 준비 점검", no: "08" },
  { href: "/help", label: "사용 안내", no: "?" },
];

export function Nav() {
  const path = usePathname();
  const issues = useIssues();
  const reviewer = useStore((s) => s.reviewer);
  const setReviewer = useStore((s) => s.setReviewer);
  const mounted = useMounted();
  const open = issues.filter((i) => i.status === "open" || i.status === "regressed").length;
  const critical = issues.filter((i) => i.severity === "critical" && (i.status === "open" || i.status === "regressed")).length;
  const run = RUNS.find((r) => r.runId === CURRENT_RUN);

  return (
    <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-surface flex flex-col lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
      <div className="px-4 py-4 border-b border-border flex items-center justify-between gap-2">
        <div>
          <div className="eyebrow">마포구청 · 업무 지원</div>
          <div className="serif font-bold text-[16px] leading-tight mt-0.5 text-ink">홈페이지 콘텐츠 관리</div>
          <div className="text-[11px] text-muted mt-0.5">정확한 정보, 신뢰받는 행정</div>
        </div>
        <ThemeToggle className="lg:hidden" />
      </div>
      <nav className="p-2 lg:flex-1 flex lg:flex-col gap-1 lg:gap-0 overflow-x-auto" aria-label="주 메뉴">
        {[ITEMS[0], ITEMS[1], ITEMS[4], ITEMS[2], ITEMS[5], ITEMS[3], ITEMS[7], ITEMS[6], ITEMS[8]].map((it, index) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 lg:justify-between px-3 py-2 rounded-md text-[13px] lg:mb-0.5 whitespace-nowrap ${
                active ? "bg-accent-soft text-accent font-medium" : "hover:bg-soft"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex items-center gap-2">
                <span className="mono text-[10px] text-muted w-4">{String(index + 1).padStart(2, "0")}</span>
                {it.label}
              </span>
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
            긴급 검토 필요 {critical}건
          </div>
        )}
        <a
          href={HANDBOOK_LINKS.home}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex mx-1 mt-3 px-3 py-2 rounded-md border border-dashed border-border text-[12px] text-muted hover:text-accent hover:border-accent items-center justify-between"
        >
          <span>AI 웹핸드북 열기</span>
          <span aria-hidden>↗</span>
        </a>
      </nav>
      <div className="p-3 border-t border-border text-[12px] text-muted space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span>
            <button type="button" className="btn btn-sm" onClick={() => window.dispatchEvent(new Event("open-search"))}>메뉴·용어 검색</button>
          </span>
          <ThemeToggle className="hidden lg:inline-flex" />
        </div>
        <label className="block">
          <span className="block mb-1">작업 담당자 이름</span>
          <input className="input" value={mounted ? reviewer : ""} onChange={(e) => setReviewer(e.target.value)} aria-label="승인자 이름" />
        </label>
        {run && (
          <div className="hidden lg:block">
            최근 점검 #{run.runId}<br />
            {run.finishedAt?.slice(0, 16).replace("T", " ")}
          </div>
        )}
        <div className="text-[11px]">담당자 이름은 처리 이력에 기록됩니다.</div>
      </div>
    </aside>
  );
}
