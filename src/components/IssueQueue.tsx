"use client";

import { useMounted } from "@/lib/useMounted";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Disposition, Issue } from "@/lib/types";
import { useIssues, useStore } from "@/store/useStore";
import { DEPARTMENTS } from "@/data/sites";
import { DETECTOR_NAMES, DISPOSITION_LABEL, ISSUE_MESSAGES, REJECT_REASONS } from "@/data/messages";
import { docById } from "@/data/docs";
import { GradeBadge, SeverityBadge, StatusBadge, Empty } from "@/components/ui";
import { Evidence } from "@/components/Evidence";

const SEV_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export function IssueQueue() {
  const params = useSearchParams();
  const router = useRouter();
  const issues = useIssues();
  const decide = useStore((s) => s.decide);
  const bulkDecide = useStore((s) => s.bulkDecide);
  const reopen = useStore((s) => s.reopen);
  const decisions = useStore((s) => s.decisions);
  const mounted = useMounted();

  const get = (k: string) => params.get(k) ?? "";
  const set = (k: string, v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v);
    else p.delete(k);
    router.replace("/issues?" + p.toString());
  };
  const tab = get("grade") || "suggest";

  const filtered = useMemo(() => {
    const status = get("status");
    return issues
      .filter((i) => (tab === "all" ? true : i.grade === tab))
      .filter((i) => (get("detector") ? i.detector === get("detector") : true))
      .filter((i) => (get("severity") ? i.severity === get("severity") : true))
      .filter((i) => (get("department") ? i.department === get("department") : true))
      .filter((i) => (get("run") ? String(i.firstSeenRun) === get("run") : true))
      .filter((i) => (status ? i.status === status : i.status === "open" || i.status === "regressed" || i.status === "deferred"))
      .filter((i) => {
        const q = get("q").toLowerCase();
        if (!q) return true;
        const d = docById(i.docId);
        return [i.code, i.department, d?.title, d?.h1, d?.canonicalUrl, i.evidence.excerpt].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity] || (a.status === "regressed" ? -1 : 1) || a.issueId - b.issueId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, params, tab]);

  const [cursor, setCursor] = useState(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDisp, setEditDisp] = useState<Disposition | "">("");
  const [timing, setTiming] = useState<{ start: number; durations: number[] }>(() => ({ start: Date.now(), durations: [] }));
  const listRef = useRef<HTMLDivElement>(null);

  // 필터가 바뀌면 커서·선택을 초기화 (렌더 중 상태 조정 패턴)
  const filterKey = tab + "|" + params.toString();
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setCursor(0);
    setSelected(new Set());
  }

  const current: Issue | undefined = filtered[Math.min(cursor, Math.max(0, filtered.length - 1))];

  const act = useCallback(
    (decision: "approve" | "reject" | "defer", note = "") => {
      const targets = selected.size ? [...selected] : current ? [current.issueId] : [];
      if (!targets.length) return;
      const now = Date.now();
      setTiming((t) => ({ start: now, durations: [...t.durations, now - t.start].slice(-50) }));
      if (targets.length > 1) {
        bulkDecide(targets, decision, note);
        setSelected(new Set());
      } else {
        const iss = issues.find((i) => i.issueId === targets[0])!;
        const disp = decision === "approve" ? ((editDisp || iss.suggestion?.disposition) ?? null) : null;
        decide(targets[0], decision, disp, note, editTitle || undefined);
      }
      setEditing(false);
      setRejecting(false);
      setEditTitle("");
      setEditDisp("");
    },
    [selected, current, issues, decide, bulkDecide, editDisp, editTitle],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") {
        if (e.key === "Escape") (t as HTMLInputElement).blur();
        return;
      }
      if (rejecting) {
        const n = Number(e.key);
        if (n >= 1 && n <= REJECT_REASONS.length) act("reject", REJECT_REASONS[n - 1]);
        if (e.key === "Escape") setRejecting(false);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "j":
          setCursor((c) => Math.min(c + 1, filtered.length - 1));
          break;
        case "k":
          setCursor((c) => Math.max(c - 1, 0));
          break;
        case "a":
          act("approve");
          break;
        case "r":
          setRejecting(true);
          break;
        case "d":
          act("defer");
          break;
        case "e":
          setEditing((v) => !v);
          break;
        case "x":
          if (current) setSelected((s) => {
            const n = new Set(s);
            if (n.has(current.issueId)) n.delete(current.issueId);
            else n.add(current.issueId);
            return n;
          });
          break;
        case "o":
          if (current) window.open(docById(current.docId)?.canonicalUrl, "_blank", "noopener");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [act, filtered.length, current, rejecting]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const median = useMemo(() => {
    const d = [...timing.durations].sort((a, b) => a - b);
    return d.length ? d[Math.floor(d.length / 2)] / 1000 : null;
  }, [timing]);

  const doc = docById(current?.docId);
  const msg = current ? ISSUE_MESSAGES[current.code] : undefined;
  const sameGroup = current
    ? issues.filter((i) => i.issueId !== current.issueId && i.code === current.code && (i.status === "open" || i.status === "regressed") && (current.clusterId ? i.clusterId === current.clusterId : true))
    : [];

  if (!mounted) return <div className="p-6 text-muted">불러오는 중…</div>;

  return (
    <div className="flex flex-col lg:flex-row lg:h-screen">
      {/* 왼쪽: 목록 */}
      <div className="w-full lg:w-[420px] shrink-0 border-b lg:border-b-0 lg:border-r border-border flex flex-col max-h-[60vh] lg:max-h-none">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex gap-1" role="tablist" aria-label="등급">
            {[
              ["suggest", "자동 제안"],
              ["observe", "관찰"],
              ["all", "전체"],
            ].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={`btn btn-sm ${tab === k ? "btn-primary" : ""}`} onClick={() => set("grade", k === "suggest" ? "" : k)} type="button">
                {l}
              </button>
            ))}
            <span className="ml-auto text-[12px] text-muted self-center">{filtered.length}건</span>
          </div>
          <input className="input" placeholder="검색: 코드·제목·URL·부서 (/)" value={get("q")} onChange={(e) => set("q", e.target.value)} aria-label="검색" />
          <div className="grid grid-cols-2 gap-1.5">
            <select className="input" value={get("detector")} onChange={(e) => set("detector", e.target.value)} aria-label="탐지기">
              <option value="">유형 전체</option>
              {Object.entries(DETECTOR_NAMES).map(([k, v]) => (
                <option key={k} value={k}>
                  {k} {v}
                </option>
              ))}
            </select>
            <select className="input" value={get("severity")} onChange={(e) => set("severity", e.target.value)} aria-label="심각도">
              <option value="">심각도 전체</option>
              <option value="critical">긴급</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
            <select className="input" value={get("department")} onChange={(e) => set("department", e.target.value)} aria-label="부서">
              <option value="">부서 전체</option>
              {[...new Set([...DEPARTMENTS, ...issues.map((i) => i.department)])].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select className="input" value={get("status")} onChange={(e) => set("status", e.target.value)} aria-label="상태">
              <option value="">대기·보류·재발</option>
              <option value="open">대기</option>
              <option value="regressed">재발</option>
              <option value="deferred">보류</option>
              <option value="approved">승인</option>
              <option value="rejected">반려</option>
              <option value="fixed">해결됨</option>
            </select>
          </div>
        </div>
        <div ref={listRef} className="flex-1 overflow-y-auto" role="listbox" aria-label="이슈 목록">
          {filtered.length === 0 && <Empty text="조건에 맞는 이슈가 없습니다." />}
          {filtered.map((i, idx) => {
            const d = docById(i.docId);
            const active = idx === cursor;
            return (
              <div
                key={i.issueId}
                data-idx={idx}
                role="option"
                aria-selected={active}
                tabIndex={-1}
                onClick={() => setCursor(idx)}
                className={`px-3 py-2 border-b border-border cursor-pointer flex gap-2 ${active ? "bg-accent-soft" : "hover:bg-background"}`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(i.issueId)}
                  onChange={(e) => {
                    const n = new Set(selected);
                    if (e.target.checked) n.add(i.issueId);
                    else n.delete(i.issueId);
                    setSelected(n);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="선택"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <SeverityBadge s={i.severity} />
                    <span className="mono text-[11px] text-muted">{i.code}</span>
                    {i.status !== "open" && <StatusBadge s={i.status} />}
                    {i.fixtureId && <span className="text-[10px] text-muted border border-border rounded px-1">{i.fixtureId}</span>}
                  </div>
                  <div className="text-[13px] mt-0.5 truncate">{ISSUE_MESSAGES[i.code]?.label ?? i.code}</div>
                  <div className="text-[11px] text-muted truncate">{d?.h1 ?? d?.title ?? d?.canonicalUrl ?? "(템플릿 단위)"} · {i.department}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-2 border-t border-border text-[11px] text-muted flex flex-wrap gap-x-3 gap-y-1">
          <span><kbd>J</kbd>/<kbd>K</kbd> 이동</span>
          <span><kbd>A</kbd> 승인</span>
          <span><kbd>R</kbd> 반려</span>
          <span><kbd>D</kbd> 보류</span>
          <span><kbd>E</kbd> 제안 수정</span>
          <span><kbd>X</kbd> 선택</span>
          <span><kbd>O</kbd> 원본</span>
          {median != null && <span className="ml-auto">승인 중앙값 {median.toFixed(1)}초 (목표 ≤10)</span>}
        </div>
      </div>

      {/* 오른쪽: 증거 패널 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {!current ? (
          <Empty text="이슈를 선택하세요." />
        ) : (
          <div className="p-5 max-w-5xl">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge s={current.severity} />
                  <GradeBadge g={current.grade} />
                  <StatusBadge s={current.status} />
                  <span className="mono text-[12px] text-muted">{current.code}</span>
                  <span className="text-[12px] text-muted">신뢰도 {(current.confidence * 100).toFixed(0)}%</span>
                </div>
                <h1 className="text-[18px] font-semibold mt-1">{msg?.label ?? current.code}</h1>
                <div className="text-[13px] text-muted">
                  {DETECTOR_NAMES[current.detector]} · {current.department} · 최초 #{current.firstSeenRun} · 최근 #{current.lastSeenRun}
                  {current.fixtureId && <> · 회귀 사례 {current.fixtureId}</>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {selected.size > 1 && <span className="text-[12px] self-center text-accent">선택 {selected.size}건 묶음 처리</span>}
                {["open", "regressed", "deferred"].includes(current.status) || selected.size ? (
                  <>
                    <button className="btn btn-primary" onClick={() => act("approve")} type="button">승인 <kbd>A</kbd></button>
                    <button className="btn" onClick={() => setRejecting(true)} type="button">반려 <kbd>R</kbd></button>
                    <button className="btn" onClick={() => act("defer")} type="button">보류 <kbd>D</kbd></button>
                    <button className="btn" onClick={() => setEditing((v) => !v)} type="button">제안 수정 <kbd>E</kbd></button>
                  </>
                ) : (
                  <button className="btn" onClick={() => reopen(current.issueId)} type="button">다시 열기</button>
                )}
              </div>
            </div>

            {rejecting && (
              <div className="card p-3 mt-3 border-accent" role="dialog" aria-label="반려 사유">
                <div className="text-[13px] mb-2">반려 사유 (숫자 키로 선택) — 같은 지문은 다시 큐에 올리지 않고 골드셋 후보로 보냅니다</div>
                <div className="flex flex-wrap gap-1.5">
                  {REJECT_REASONS.map((r, i) => (
                    <button key={r} className="btn btn-sm" onClick={() => act("reject", r)} type="button"><kbd>{i + 1}</kbd> {r}</button>
                  ))}
                  <button className="btn btn-sm" onClick={() => setRejecting(false)} type="button">취소 <kbd>Esc</kbd></button>
                </div>
              </div>
            )}

            {editing && (
              <div className="card p-3 mt-3 border-accent" role="dialog" aria-label="제안 수정">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label className="text-[12px]">처분
                    <select className="input mt-1" value={editDisp || current.suggestion?.disposition || ""} onChange={(e) => setEditDisp(e.target.value as Disposition)}>
                      {Object.entries(DISPOSITION_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  {current.detector === "D2" && (
                    <label className="text-[12px]">제안 title
                      <input className="input mt-1" value={editTitle || current.suggestion?.newTitle || ""} onChange={(e) => setEditTitle(e.target.value)} />
                    </label>
                  )}
                </div>
                <div className="text-[11px] text-muted mt-2">수정 후 <kbd>A</kbd> 승인하면 수정된 제안이 기록됩니다.</div>
              </div>
            )}

            {decisions[current.issueId] && (
              <div className="text-[12px] text-muted mt-3">
                {decisions[current.issueId].decidedBy} · {decisions[current.issueId].decidedAt.slice(0, 19).replace("T", " ")} · {DISPOSITION_LABEL[decisions[current.issueId].disposition ?? ""] ?? ""} {decisions[current.issueId].note}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mt-4">
              <div className="lg:col-span-2 space-y-3">
                <div className="card p-4">
                  <h2 className="text-[12px] text-muted mb-1">무엇이 문제인가 (쉬운 말)</h2>
                  <p className="text-[14px]">{msg?.what}</p>
                </div>
                <Evidence issue={current} />
              </div>
              <div className="space-y-3">
                <div className="card p-4">
                  <h2 className="text-[12px] text-muted mb-1">제안 조치</h2>
                  {current.suggestion?.disposition && <div className="font-medium">{DISPOSITION_LABEL[current.suggestion.disposition]}</div>}
                  {current.suggestion?.newTitle && <div className="mono text-[12px] mt-1 break-all">→ {current.suggestion.newTitle}</div>}
                  {current.suggestion?.canonicalUrl && <div className="mono text-[12px] mt-1 break-all">대표: {current.suggestion.canonicalUrl}</div>}
                  {current.suggestion?.text && <p className="text-[13px] mt-1">{current.suggestion.text}</p>}
                  {current.suggestion?.aiDraft && <div className="text-[11px] mt-2 inline-block border border-medium/50 text-medium rounded px-1.5">AI 초안 — 근거 인용 확인 후 승인</div>}
                  <p className="text-[12px] text-muted mt-2">{msg?.fix}</p>
                </div>
                <div className="card p-4">
                  <h2 className="text-[12px] text-muted mb-1">문서</h2>
                  {doc ? (
                    <>
                      <div className="text-[13px] font-medium">{doc.h1 ?? "(h1 없음)"}</div>
                      <div className="text-[12px] text-muted">{doc.pageType} · {doc.department ?? "부서 미상"} {doc.postedAt && `· 게시 ${doc.postedAt}`}</div>
                      <a className="mono text-[12px] text-accent break-all block mt-1" href={doc.canonicalUrl} target="_blank" rel="noopener noreferrer">{doc.canonicalUrl}</a>
                      {doc.aliasUrls.length > 0 && <div className="text-[11px] text-muted mt-1">별칭 URL {doc.aliasUrls.length}개</div>}
                    </>
                  ) : (
                    <div className="text-[12px] text-muted">템플릿 단위 이슈 (문서 없음)</div>
                  )}
                  {current.relatedDocIds.length > 0 && <div className="text-[11px] text-muted mt-1">관련 문서 {current.relatedDocIds.length}건</div>}
                </div>
                {sameGroup.length > 0 && (
                  <div className="card p-4">
                    <h2 className="text-[12px] text-muted mb-1">같은 코드 대기 {sameGroup.length}건</h2>
                    <button className="btn btn-sm" type="button" onClick={() => setSelected(new Set([current.issueId, ...sameGroup.map((i) => i.issueId)]))}>
                      묶음 선택 후 일괄 처리
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
