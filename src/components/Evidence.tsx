import type { Issue } from "@/lib/types";
import { docById } from "@/data/docs";

// 증거 패널은 이슈 코드별로 모양이 다르다 (구성명세서 10장):
// D1 두 문서 나란히, D2 title·h1·본문 첫 문단, D3 신호와 인용 문장, D7 값별 출처 표

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h2 className="text-[12px] text-muted mb-2">{title}</h2>
      {children}
    </div>
  );
}

function Quote({ text }: { text: string }) {
  return <blockquote className="border-l-2 border-accent pl-3 text-[13px] whitespace-pre-wrap">{text}</blockquote>;
}

export function Evidence({ issue }: { issue: Issue }) {
  const e = issue.evidence;
  const doc = docById(issue.docId);

  const extra = e.extra && (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[12px] mt-2">
      {Object.entries(e.extra).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-muted">{k}</dt>
          <dd className="mono">{String(v)}</dd>
        </div>
      ))}
    </dl>
  );

  switch (issue.detector) {
    case "D1":
    case "D4":
      return (
        <Box title={issue.detector === "D1" ? "사본 비교" : "구·신 게시판 비교"}>
          {e.excerpt && <p className="text-[13px] mb-2">{e.excerpt}</p>}
          {e.compare && (
            <div className={`grid gap-2 ${e.compare.some((c) => c.text) ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {e.compare.map((c) => (
                <div key={c.url} className={`border border-border rounded p-2 ${c.label.includes("대표") || c.label.includes("권위") ? "border-accent" : ""}`}>
                  <div className="text-[11px] text-muted">{c.label}</div>
                  <a className="mono text-[11px] text-accent break-all" href={c.url} target="_blank" rel="noopener noreferrer">{c.url}</a>
                  {c.text && <p className="text-[12px] mt-1">{c.text}</p>}
                </div>
              ))}
            </div>
          )}
          {e.score != null && <div className="text-[12px] mt-2">추정 Jaccard <b>{e.score}</b></div>}
          {extra}
        </Box>
      );
    case "D2":
      return (
        <Box title="title · h1 · 브레드크럼 · 본문 첫 문단">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
            <dt className="text-muted">title</dt>
            <dd className={`mono ${!e.title && !doc?.title ? "text-critical" : ""}`}>{e.title ?? doc?.title ?? "(없음)"}</dd>
            <dt className="text-muted">h1</dt>
            <dd className="mono">{e.h1 ?? doc?.h1 ?? "(없음)"}</dd>
            <dt className="text-muted">브레드크럼</dt>
            <dd className="mono">{(e.breadcrumb ?? doc?.breadcrumb ?? []).join(" > ") || "(없음)"}</dd>
          </dl>
          {doc && <div className="mt-2"><Quote text={doc.bodyExcerpt} /></div>}
          {e.excerpt && <p className="text-[12px] text-muted mt-2">{e.excerpt}</p>}
          {extra}
        </Box>
      );
    case "D3":
      return (
        <Box title="낡음 신호와 인용">
          {e.signals && (
            <ul className="space-y-1 mb-2">
              {e.signals.map((s) => (
                <li key={s.name} className="text-[13px] flex gap-2">
                  <span className={`shrink-0 border rounded px-1 text-[11px] ${s.strength === "강" ? "border-high/50 text-high" : "border-border text-muted"}`}>{s.strength}</span>
                  <span><b>{s.name}</b> — {s.detail}</span>
                </li>
              ))}
            </ul>
          )}
          {e.excerpt && <Quote text={e.excerpt} />}
          {extra}
        </Box>
      );
    case "D7":
      return (
        <Box title="값별 출처">
          {e.excerpt && <p className="text-[13px] mb-2">{e.excerpt}</p>}
          <table className="tbl">
            <thead><tr><th>값</th><th>인용(본문에 실재, 코드로 검증)</th><th>게시일</th><th>출처</th></tr></thead>
            <tbody>
              {e.values?.map((v, i) => (
                <tr key={i}>
                  <td className="mono font-semibold">{v.value}</td>
                  <td className="text-[12px]">「{v.quote}」</td>
                  <td className="mono text-[12px]">{v.postedAt ?? "–"}</td>
                  <td><a className="mono text-[11px] text-accent break-all" href={v.url} target="_blank" rel="noopener noreferrer">{v.url.replace("https://", "")}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
          {extra}
        </Box>
      );
    case "D5":
      return (
        <Box title="URL 패턴 · 링크">
          {e.pattern && <div className="mono text-[12px] bg-background rounded p-2 break-all mb-2">{e.pattern}</div>}
          {e.excerpt && <p className="text-[13px]">{e.excerpt}</p>}
          {extra}
        </Box>
      );
    default:
      return (
        <Box title="근거">
          {e.excerpt && <Quote text={e.excerpt} />}
          {extra}
        </Box>
      );
  }
}
