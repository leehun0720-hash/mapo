"use client";

import { useMounted } from "@/lib/useMounted";
import { useState } from "react";
import { CLUSTERS, docById } from "@/data/docs";
import { siteById } from "@/data/sites";
import { useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";

// 본문 차이 보기: 단어 단위 단순 diff (화면용)
function wordDiff(a: string, b: string) {
  const A = a.split(/(\s+)/), B = b.split(/(\s+)/);
  const setB = new Set(B), setA = new Set(A);
  return {
    left: A.map((w, i) => ({ w, changed: !setB.has(w) && w.trim() !== "", i })),
    right: B.map((w, i) => ({ w, changed: !setA.has(w) && w.trim() !== "", i })),
  };
}

export default function ClustersPage() {
  const overrides = useStore((s) => s.canonicalOverrides);
  const setCanonical = useStore((s) => s.setCanonical);
  const [sel, setSel] = useState(CLUSTERS[0]?.clusterId ?? 0);
  const mounted = useMounted();
  const cluster = CLUSTERS.find((c) => c.clusterId === sel)!;
  const canonId = overrides[sel]?.docId ?? cluster.canonicalDocId;
  const canon = docById(canonId)!;
  const others = cluster.docIds.filter((id) => id !== canonId).map((id) => docById(id)!);
  const inlinks: Record<number, number> = { 101: 212, 102: 6, 103: 3, 104: 9, 105: 4, 201: 48, 202: 11 };

  return (
    <div className="pb-10">
      <PageHeader title="중복 클러스터" sub="같은 문서의 URL 묶음. 대표 URL을 바꾸면 canonical 맵·매니페스트에 즉시 반영된다. 자동 병합은 하지 않는다." />
      <div className="px-6 grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-3">
        <div className="card overflow-hidden">
          {CLUSTERS.map((c) => {
            const d = docById(overrides[c.clusterId]?.docId ?? c.canonicalDocId)!;
            return (
              <button key={c.clusterId} type="button" onClick={() => setSel(c.clusterId)} className={`w-full text-left px-3 py-2.5 border-b border-border ${sel === c.clusterId ? "bg-accent-soft" : "hover:bg-background"}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] border rounded px-1 ${c.kind === "exact" ? "border-accent/50 text-accent" : "border-medium/50 text-medium"}`}>{c.kind}</span>
                  <span className="text-[13px] font-medium truncate">{d.h1 ?? d.title}</span>
                </div>
                <div className="text-[11px] text-muted">#{c.clusterId} · {c.docIds.length}개 URL{c.jaccard != null && ` · Jaccard ${c.jaccard}`}</div>
              </button>
            );
          })}
          <div className="p-3 text-[11px] text-muted">시연 표본 {CLUSTERS.length}묶음. 실제 실행에서는 exact(SHA-256)·near(MinHash LSH ≥0.70 → Jaccard ≥0.85) 클러스터가 수천 개 생긴다.</div>
        </div>

        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <h2 className="font-semibold">클러스터 #{cluster.clusterId} · {cluster.kind}</h2>
              <span className="text-[12px] text-muted">대표 선정 규칙: {mounted && overrides[sel] ? `사람 지정 (${overrides[sel].by}, ${overrides[sel].at.slice(0, 10)})` : cluster.canonicalRule}</span>
            </div>
            <table className="tbl mt-2">
              <thead><tr><th></th><th>호스트</th><th>URL</th><th>인링크</th><th>선언 canonical</th><th>게시일</th><th></th></tr></thead>
              <tbody>
                {[canon, ...others].map((d) => {
                  const isCanon = d.docId === canonId;
                  return (
                    <tr key={d.docId} className={isCanon ? "bg-accent-soft/40" : ""}>
                      <td>{isCanon ? <span className="text-[11px] text-accent font-medium">대표</span> : <span className="text-[11px] text-muted">사본</span>}</td>
                      <td className="mono text-[12px]">{siteById(d.siteId)?.siteKey}</td>
                      <td><a className="mono text-[12px] text-accent break-all" href={d.canonicalUrl} target="_blank" rel="noopener noreferrer">{d.canonicalUrl.replace("https://", "")}</a></td>
                      <td className="mono">{inlinks[d.docId] ?? 0}</td>
                      <td className="mono text-[12px] text-muted">{d.declaredCanonical ?? "없음"}</td>
                      <td className="mono text-[12px]">{d.postedAt ?? "–"}</td>
                      <td>{!isCanon && <button className="btn btn-sm" type="button" onClick={() => setCanonical(cluster.clusterId, d.docId)}>대표로</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-[11px] text-muted mt-2">선정 순서: ① owner_path_prefixes 소속 → ② site.priority → ③ 선언된 canonical → ④ 가장 짧은 url_norm → ⑤ 인링크 수. 사람이 바꾸면 cluster.decided_by에 기록.</p>
          </div>

          {cluster.kind === "near" && others[0] && (
            <div className="card p-4">
              <h2 className="font-semibold mb-2">본문 차이 보기</h2>
              {(() => {
                const { left, right } = wordDiff(canon.bodyExcerpt, others[0].bodyExcerpt);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
                    <div>
                      <div className="text-[11px] text-muted mb-1">대표 · {siteById(canon.siteId)?.siteKey}</div>
                      <p>{left.map((t) => <span key={t.i} className={t.changed ? "bg-accent-soft underline decoration-accent" : ""}>{t.w}</span>)}</p>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted mb-1">사본 · {siteById(others[0].siteId)?.siteKey}</div>
                      <p>{right.map((t) => <span key={t.i} className={t.changed ? "bg-accent-soft underline decoration-accent" : ""}>{t.w}</span>)}</p>
                    </div>
                  </div>
                );
              })()}
              <p className="text-[11px] text-muted mt-2">숫자·날짜만 다르면 병합 제안 없이 D7 사실 충돌로 넘긴다.</p>
            </div>
          )}

          {cluster.kind === "exact" && (
            <div className="card p-4">
              <h2 className="font-semibold mb-2">본문 (동일)</h2>
              <p className="text-[13px]">{canon.bodyExcerpt}</p>
              <p className="text-[11px] text-muted mt-2">SHA-256 {canon.contentSha256}… · {cluster.docIds.length}개 호스트에서 동일</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
