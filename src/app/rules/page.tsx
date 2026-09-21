"use client";

import { useMounted } from "@/lib/useMounted";
import { useMemo, useState } from "react";
import { useIssues, useStore } from "@/store/useStore";
import { PageHeader } from "@/components/ui";
import type { Rules } from "@/lib/types";

function ListEditor({
  title,
  hint,
  value,
  onSave,
  preview,
}: {
  title: string;
  hint: string;
  value: string[];
  onSave: (v: string[]) => void;
  preview: (v: string[]) => string;
}) {
  const [text, setText] = useState(value.join("\n"));
  const next = text.split("\n").map((s) => s.trim()).filter(Boolean);
  const dirty = next.join("\n") !== value.join("\n");
  return (
    <div className="card p-4">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-[12px] text-muted mb-2">{hint}</p>
      <textarea className="input mono h-40" value={text} onChange={(e) => setText(e.target.value)} aria-label={title} />
      <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
        <span className="text-[12px] text-muted">{next.length}개 {dirty && <>· 저장 시 영향: {preview(next)}</>}</span>
        <div className="flex gap-1.5">
          <button className="btn btn-sm" type="button" disabled={!dirty} onClick={() => setText(value.join("\n"))}>되돌리기</button>
          <button className="btn btn-sm btn-primary" type="button" disabled={!dirty} onClick={() => onSave(next)}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default function RulesPage() {
  const rules = useStore((s) => s.rules);
  const setRules = useStore((s) => s.setRules);
  const resetRules = useStore((s) => s.resetRules);
  const history = useStore((s) => s.rulesHistory);
  const issues = useIssues();
  const mounted = useMounted();

  const openD3 = useMemo(() => issues.filter((i) => i.detector === "D3" && i.status === "open"), [issues]);
  const openD5 = useMemo(() => issues.filter((i) => i.detector === "D5" && i.status === "open"), [issues]);

  const save = (field: keyof Rules, v: Rules[keyof Rules], summary: string) => setRules(field, v, summary);

  if (!mounted) return <div className="p-6 text-muted">불러오는 중…</div>;

  return (
    <div className="pb-10">
      <PageHeader
        title="규칙 편집"
        sub="rules/*.yaml에 해당. 임계값과 사전은 코드에 박지 않고 여기서 관리한다. 변경 이력은 감사 로그에 남는다."
        right={<button className="btn" type="button" onClick={resetRules}>초기값으로</button>}
      />
      <div className="px-6 grid grid-cols-1 xl:grid-cols-2 gap-3">
        <ListEditor
          key={"kw:" + rules.timeboundKeywords.join("|")}
          title="시한 키워드 사전 (D3 S3)"
          hint="본문에 있으면 '강' 신호. 초기값: 코로나19, 확진자, 거리두기, 민선8기 …"
          value={rules.timeboundKeywords}
          onSave={(v) => save("timeboundKeywords", v, `시한 키워드 ${v.length}개`)}
          preview={(v) => {
            const hit = openD3.filter((i) => i.evidence.signals?.some((s) => v.some((k) => s.detail.includes(k)))).length;
            return `D3 대기 이슈 ${openD3.length}건 중 키워드 적중 ${hit}건`;
          }}
        />
        <ListEditor
          key={"np:" + rules.noiseParams.join("|")}
          title="잡음 파라미터 (URL 정규화 4단계)"
          hint="파라미터 유의성 실험 결과 noise 판정된 것. 실험 근거: 상세 페이지 표본 5개 중 5개 본문 동일."
          value={rules.noiseParams}
          onSave={(v) => save("noiseParams", v, `잡음 파라미터 ${v.length}개`)}
          preview={(v) => {
            const hit = openD5.filter((i) => i.evidence.pattern && v.some((p) => i.evidence.pattern!.includes(p))).length;
            return `D5 템플릿 이슈 ${hit}건의 URL 패턴에 포함 · url_norm 재계산 필요`;
          }}
        />
        <ListEditor
          key={"cb:" + rules.citizenBoards.join("|")}
          title="시민 작성 게시판 (경로 접두사)"
          hint="D8만 적용, LLM 미전송, 매니페스트 제외. 로그인 영역은 애초에 수집하지 않는다."
          value={rules.citizenBoards}
          onSave={(v) => save("citizenBoards", v, `시민 게시판 ${v.length}개`)}
          preview={(v) => `citizen_post 판정 경로 ${v.length}개`}
        />
        <div className="card p-4">
          <h2 className="font-semibold">게시판 쌍 (D4 이원화)</h2>
          <p className="text-[12px] text-muted mb-2">권위 출처 기본값은 current(nPortal). 기관 확인 필요.</p>
          <table className="tbl">
            <thead><tr><th>구(legacy)</th><th>신(current)</th><th>권위</th></tr></thead>
            <tbody>
              {rules.boardPairs.map((p, i) => (
                <tr key={i}>
                  <td className="mono text-[12px]">{p.legacy}</td>
                  <td className="mono text-[12px]">{p.current}</td>
                  <td>
                    <select
                      className="input"
                      value={p.authority}
                      onChange={(e) => {
                        const next = rules.boardPairs.map((x, j) => (j === i ? { ...x, authority: e.target.value as "legacy" | "current" } : x));
                        save("boardPairs", next, `게시판 쌍 권위 → ${e.target.value}`);
                      }}
                    >
                      <option value="current">current (nPortal)</option>
                      <option value="legacy">legacy (구 게시판)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-4 xl:col-span-2">
          <h2 className="font-semibold">대상 동의어 (D7 subject_aliases)</h2>
          <p className="text-[12px] text-muted mb-2">임베딩으로 묶은 대상을 사람이 보정한다. 한 줄에 「대표명: 동의어1, 동의어2」.</p>
          <AliasEditor key={JSON.stringify(rules.subjectAliases)} value={rules.subjectAliases} onSave={(v) => save("subjectAliases", v, `동의어 ${Object.keys(v).length}묶음`)} />
        </div>
        <div className="card p-4 xl:col-span-2">
          <h2 className="font-semibold mb-2">변경 이력 (audit)</h2>
          {history.length === 0 ? (
            <p className="text-[12px] text-muted">아직 변경이 없습니다.</p>
          ) : (
            <ul className="text-[12px] space-y-0.5">
              {history.slice(0, 20).map((h, i) => (
                <li key={i} className="mono">{h.at.slice(0, 19).replace("T", " ")} · {h.by} · {h.field} · {h.summary}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function AliasEditor({ value, onSave }: { value: Record<string, string[]>; onSave: (v: Record<string, string[]>) => void }) {
  const toText = (v: Record<string, string[]>) => Object.entries(v).map(([k, a]) => `${k}: ${a.join(", ")}`).join("\n");
  const [text, setText] = useState(toText(value));
  const parse = (t: string) => {
    const out: Record<string, string[]> = {};
    for (const line of t.split("\n")) {
      const [k, rest] = line.split(":");
      if (!k?.trim()) continue;
      out[k.trim()] = (rest ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    }
    return out;
  };
  const dirty = toText(parse(text)) !== toText(value);
  return (
    <>
      <textarea className="input mono h-32" value={text} onChange={(e) => setText(e.target.value)} aria-label="대상 동의어" />
      <div className="flex justify-end mt-2 gap-1.5">
        <button className="btn btn-sm" type="button" disabled={!dirty} onClick={() => setText(toText(value))}>되돌리기</button>
        <button className="btn btn-sm btn-primary" type="button" disabled={!dirty} onClick={() => onSave(parse(text))}>저장</button>
      </div>
    </>
  );
}
