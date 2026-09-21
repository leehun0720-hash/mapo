import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { APPROVER_RULES, FAQ, GLOSSARY, HANDBOOK_CHAPTERS, HANDBOOK_LINKS, ROADMAP, UPDATES } from "@/data/handbook";
import { DISPOSITION_LABEL } from "@/data/messages";

export const metadata: Metadata = { title: "매뉴얼 · 도움말" };

const QUICK: [string, React.ReactNode][] = [
  ["찾기", <>어디서든 <kbd>/</kbd> 또는 <kbd>Ctrl</kbd>+<kbd>K</kbd>를 누르면 통합검색이 열립니다. 화면·이슈·문서·사이트·용어·핸드북 챕터를 한 번에 찾습니다.</>],
  ["승인", <>이슈 큐에서 <kbd>J</kbd>/<kbd>K</kbd>로 이동하고 <kbd>A</kbd> 승인, <kbd>R</kbd> 반려(사유는 숫자 키), <kbd>D</kbd> 보류, <kbd>E</kbd> 제안 수정, <kbd>X</kbd> 선택 후 묶음 처리, <kbd>O</kbd> 원본 열기. 목표는 승인 1건 10초입니다.</>],
  ["처분", <>{Object.values(DISPOSITION_LABEL).join(" · ")}. <b>삭제 제안은 없습니다.</b> 고시공고의 「폐기」는 보관 표시 + 색인 제외입니다.</>],
  ["대표 URL", <>중복 클러스터에서 [대표로]를 누르면 canonical 맵·301 맵·매니페스트가 즉시 따라갑니다. 자동 병합은 하지 않습니다.</>],
  ["규칙", <>시한 키워드·잡음 파라미터·게시판 쌍·대상 동의어는 코드가 아니라 규칙 편집에서 관리하고, 저장 전에 영향받는 이슈 수를 미리 봅니다.</>],
  ["내보내기", <>승인된 이슈만 수정 요청서(tickets.xlsx)에 담깁니다. 매니페스트는 approved_only일 때 미승인 제안을 hold로 냅니다. 벤더 토큰은 매니페스트만 읽습니다.</>],
  ["인쇄", <>대시보드 상단의 [인쇄]로 진단 리포트용 표를 뽑을 수 있습니다. 메뉴·버튼은 인쇄에서 빠집니다.</>],
  ["화면", <>왼쪽 아래(모바일은 상단)에서 자동/밝게/어둡게를 바꿀 수 있습니다.</>],
];

export default function HelpPage() {
  return (
    <div className="pb-10">
      <PageHeader title="매뉴얼 · 도움말" sub="3분이면 익힙니다. 짝 앱 「마포구청 AI 웹핸드북」과 같은 조작 규칙을 씁니다." />
      <div className="px-6 space-y-3 max-w-5xl">
        <section className="card p-5">
          <div className="eyebrow mb-1">QUICK START</div>
          <h2 className="font-semibold text-[15px] mb-2">빠른 사용법</h2>
          <table className="tbl">
            <tbody>
              {QUICK.map(([k, v]) => (
                <tr key={k}>
                  <th className="w-24 align-top">{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card p-5">
          <div className="eyebrow mb-1">RULES</div>
          <h2 className="font-semibold text-[15px] mb-1">승인자 5원칙</h2>
          <p className="text-[12px] text-muted mb-3">핸드북 「공무원 AI 사용 5원칙」을 이 앱의 승인 흐름에 맞춰 옮겼습니다.</p>
          <ol className="space-y-2">
            {APPROVER_RULES.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="mono text-accent shrink-0">{i + 1}.</span>
                <span>
                  <b>{t}</b> — <span className="text-[13px]">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card p-5">
          <div className="eyebrow mb-1">HANDBOOK</div>
          <h2 className="font-semibold text-[15px] mb-1">핸드북에서 이어지는 장</h2>
          <p className="text-[12px] text-muted mb-3">핸드북은 「왜·무엇을」, 이 앱은 「어떻게」입니다. 핸드북 영역 ③의 네 가지 과업을 이 앱이 실행합니다.</p>
          <ul className="space-y-2">
            {HANDBOOK_CHAPTERS.map((c) => (
              <li key={c.key} className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                <a href={HANDBOOK_LINKS[c.key]} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline shrink-0">
                  <span className="mono text-[11px] text-muted mr-2">{c.part}</span>
                  {c.title} ↗
                </a>
                <span className="text-[12px] text-muted">{c.why}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="eyebrow mb-1">ROADMAP</div>
          <h2 className="font-semibold text-[15px] mb-1">12개월 로드맵에서 이 앱의 자리</h2>
          <table className="tbl">
            <thead>
              <tr>
                <th>시기</th>
                <th>핸드북 로드맵</th>
                <th>이 앱이 맡는 일</th>
              </tr>
            </thead>
            <tbody>
              {ROADMAP.map((r) => (
                <tr key={r.when}>
                  <td className="mono text-[12px] whitespace-nowrap">{r.when}</td>
                  <td>{r.what}</td>
                  <td className="text-[13px]">{r.mine}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-muted mt-2">하나의 마일스톤: 2027년 6월 행정사무감사에 KPI를 숫자로 보고. 이 앱은 그중 ⑦ 콘텐츠 신선도를 맡습니다.</p>
        </section>

        <section className="card p-5">
          <div className="eyebrow mb-1">FAQ</div>
          <h2 className="font-semibold text-[15px] mb-2">자주 묻는 질문</h2>
          <div className="space-y-1">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-border last:border-b-0 py-2">
                <summary className="cursor-pointer text-[13px] font-medium list-none flex justify-between">
                  {q} <span className="text-muted group-open:rotate-90 transition-transform" aria-hidden>›</span>
                </summary>
                <p className="text-[13px] text-muted mt-1">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="card p-5" id="glossary">
          <div className="eyebrow mb-1">GLOSSARY</div>
          <h2 className="font-semibold text-[15px] mb-2">용어집</h2>
          <dl className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-4 gap-y-2">
            {GLOSSARY.map(([t, d]) => (
              <div key={t} className="contents">
                <dt className="font-medium text-[13px]">{t}</dt>
                <dd className="text-[13px] text-muted">{d}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[11px] text-muted mt-3">
            더 많은 용어는 핸드북{" "}
            <a href={HANDBOOK_LINKS.glossary} target="_blank" rel="noopener noreferrer" className="text-accent">
              용어집 ↗
            </a>
          </p>
        </section>

        <section className="card p-5">
          <div className="eyebrow mb-1">UPDATES</div>
          <h2 className="font-semibold text-[15px] mb-2">업데이트 이력</h2>
          <ul className="text-[13px] space-y-1">
            {UPDATES.map(([d, t], i) => (
              <li key={i}>
                <span className="mono text-muted mr-2">{d}</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-muted mt-3">
            위생관리 앱 v0.2 · 짝 문서: 기획서 v0.1 · 구성명세서 v0.1 (2026-09-21) · 핸드북 v1.0 (강의일 2026-09-18)
          </p>
          <p className="text-[12px] text-muted mt-1">
            문의: 도입 상담{" "}
            <a href="mailto:leesh@tenai.kr" className="text-accent">
              leesh@tenai.kr
            </a>{" "}
            · 핸드북·강의 내용은 핸드북{" "}
            <a href={HANDBOOK_LINKS.manual} target="_blank" rel="noopener noreferrer" className="text-accent">
              도움말 ↗
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
