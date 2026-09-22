"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ISSUES } from "@/data/issues";
import { DOCS } from "@/data/docs";
import { SITES } from "@/data/sites";
import { ISSUE_MESSAGES } from "@/data/messages";
import { GLOSSARY, HANDBOOK_CHAPTERS, HANDBOOK_LINKS } from "@/data/handbook";

// 통합검색 — 핸드북과 같은 조작: 어디서든 / 또는 Ctrl+K. 화면·이슈·문서·사이트·용어·핸드북 챕터를 한 번에 찾는다.

interface Hit {
  kind: "화면" | "이슈" | "문서" | "사이트" | "용어" | "핸드북";
  title: string;
  sub?: string;
  href: string;
  external?: boolean;
}

const PAGES: Hit[] = [
  { kind: "화면", title: "업무 현황", sub: "위생 점수 · KPI ⑦ · 네 가지 과업", href: "/" },
  { kind: "화면", title: "검토·승인", sub: "승인 A · 반려 R · 보류 D", href: "/issues" },
  { kind: "화면", title: "중복 문서 관리", sub: "대표 URL 변경", href: "/clusters" },
  { kind: "화면", title: "점검 기준 설정", sub: "시한 키워드 · 잡음 파라미터 · 게시판 쌍", href: "/rules" },
  { kind: "화면", title: "결과 내려받기", sub: "tickets.xlsx · manifest.json · sitemap.xml", href: "/exports" },
  { kind: "화면", title: "검사 도구", sub: "URL 정규화 · 개인정보 · title 규칙", href: "/tools" },
  { kind: "화면", title: "사업 · 견적", sub: "상품 4종 · 원가 견적 계산 · 12개월 현금 · 90일 WBS", href: "/program" },
  { kind: "화면", title: "운영 준비 점검", sub: "요구검수 16 · 오픈 관문 9 · 위험 10 · 첫 미팅 질문 10", href: "/readiness" },
  { kind: "화면", title: "사용 안내", sub: "사용법 · 승인 5원칙 · 용어집", href: "/help" },
];

function buildIndex(): Hit[] {
  const hits: Hit[] = [...PAGES];
  for (const i of ISSUES) {
    const d = DOCS.find((x) => x.docId === i.docId);
    hits.push({ kind: "이슈", title: `${i.code} · ${ISSUE_MESSAGES[i.code]?.label ?? ""}`, sub: `${d?.h1 ?? d?.title ?? ""} · ${i.department}${i.fixtureId ? " · " + i.fixtureId : ""}`, href: `/issues?grade=all&q=${encodeURIComponent(i.code)}` });
  }
  for (const d of DOCS) hits.push({ kind: "문서", title: d.h1 ?? d.title ?? d.canonicalUrl, sub: d.canonicalUrl.replace("https://", ""), href: `/issues?grade=all&q=${encodeURIComponent(d.canonicalUrl)}` });
  for (const s of SITES) hits.push({ kind: "사이트", title: s.name, sub: s.baseUrl.replace("https://", ""), href: `/?site=${s.siteKey}` });
  for (const [t, desc] of GLOSSARY) hits.push({ kind: "용어", title: t, sub: desc, href: `/help#glossary` });
  for (const c of HANDBOOK_CHAPTERS) hits.push({ kind: "핸드북", title: c.title, sub: c.part, href: HANDBOOK_LINKS[c.key], external: true });
  hits.push({ kind: "핸드북", title: "개인정보 점검기 (핸드북 도구)", sub: "TOOLS · 01", href: HANDBOOK_LINKS.toolPii, external: true });
  hits.push({ kind: "핸드북", title: "KPI 기록지 — 매달 공개할 8개 숫자", sub: "TOOLS · 06", href: HANDBOOK_LINKS.toolKpi, external: true });
  return hits;
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return index.filter((h) => h.kind === "화면" || h.kind === "핸드북").slice(0, 12);
    return index.filter((h) => `${h.kind} ${h.title} ${h.sub ?? ""}`.toLowerCase().includes(s)).slice(0, 14);
  }, [q, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable;
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
        setQ("");
        setCursor(0);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    const show = () => { setOpen(true); setQ(""); setCursor(0); setTimeout(() => inputRef.current?.focus(), 0); };
    window.addEventListener("open-search", show);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("open-search", show); };
  }, [open]);

  const go = (h: Hit) => {
    setOpen(false);
    if (h.external) window.open(h.href, "_blank", "noopener");
    else router.push(h.href);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-[12vh] px-4" onClick={() => setOpen(false)} role="presentation">
      <div className="card w-full max-w-xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="통합검색">
        <input
          ref={inputRef}
          className="w-full px-4 py-3 bg-transparent outline-none text-[15px] border-b border-border"
          placeholder="화면·이슈·문서·사이트·용어·핸드북 챕터 검색…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setCursor(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setCursor((c) => Math.min(c + 1, results.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setCursor((c) => Math.max(c - 1, 0));
            } else if (e.key === "Enter" && results[cursor]) {
              go(results[cursor]);
            }
          }}
          aria-label="검색어"
        />
        <ul className="max-h-[50vh] overflow-y-auto" role="listbox">
          {results.length === 0 && <li className="px-4 py-6 text-muted text-[13px]">결과가 없습니다.</li>}
          {results.map((h, i) => (
            <li
              key={h.kind + h.href + h.title}
              role="option"
              aria-selected={i === cursor}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(h)}
              className={`px-4 py-2 cursor-pointer flex gap-3 items-baseline ${i === cursor ? "bg-accent-soft" : ""}`}
            >
              <span className="chip shrink-0">{h.kind}</span>
              <span className="min-w-0">
                <span className="block text-[13px] truncate">
                  {h.title} {h.external && <span className="text-muted">↗</span>}
                </span>
                {h.sub && <span className="block text-[11px] text-muted truncate">{h.sub}</span>}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-4 py-2 border-t border-border text-[11px] text-muted flex gap-3">
          <span><kbd>↑</kbd><kbd>↓</kbd> 이동</span>
          <span><kbd>Enter</kbd> 열기</span>
          <span><kbd>Esc</kbd> 닫기</span>
          <span className="ml-auto">어디서든 <kbd>/</kbd> 또는 <kbd>Ctrl</kbd>+<kbd>K</kbd></span>
        </div>
      </div>
    </div>
  );
}
