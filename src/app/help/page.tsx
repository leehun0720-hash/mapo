import type { Metadata } from "next";
import { PageHeader } from "@/components/ui";
import { APPROVER_RULES, FAQ, GLOSSARY, HANDBOOK_CHAPTERS, HANDBOOK_LINKS, ROADMAP, UPDATES } from "@/data/handbook";
import { DISPOSITION_LABEL } from "@/data/messages";
import { DISPOSITION_POLICY, SIX_FIELDS } from "@/data/business";

export const metadata: Metadata = { title: "사용 안내" };

const QUICK: [string, React.ReactNode][] = [
  ["찾기", <>[메뉴·용어 검색] 버튼을 누르거나, <kbd>/</kbd> 또는 <kbd>Ctrl</kbd>+<kbd>K</kbd>를 누르면 통합검색이 열립니다. 화면·이슈·문서·사이트·용어·핸드북 챕터를 한 번에 찾습니다.</>],
  ["검토·승인", <>목록에서 문서를 선택해 원문과 점검 사유를 읽고 [승인하기], [반려하기], [나중에 검토] 중 하나를 누르세요. 여러 문서는 체크 상자로 선택할 수 있습니다. 단축키는 검토 화면에서 ‘키보드 단축키 사용’을 켠 경우에만 작동합니다.</>],
  ["처분", <>{Object.values(DISPOSITION_LABEL).join(" · ")}. <b>삭제 제안은 없습니다.</b> 고시공고의 「폐기」는 기관의 적법 절차로 별도 실행하고, 앱에서는 기록 보존(보관 + 색인 제외)까지만 처리합니다.</>],
  ["대표 URL", <>중복 문서 관리에서 [대표로]를 누르면 canonical 맵·301 맵·매니페스트가 즉시 따라갑니다. 자동 병합은 하지 않습니다.</>],
  ["규칙", <>시한 키워드·잡음 파라미터·게시판 쌍·대상 동의어는 코드가 아니라 점검 기준 설정에서 관리하고, 저장 전에 영향받는 이슈 수를 미리 봅니다.</>],
  ["결과 내려받기", <>승인된 이슈만 수정 요청서(tickets.xlsx)에 담깁니다. 매니페스트는 approved_only일 때 미승인 제안을 hold로 냅니다. 벤더 토큰은 매니페스트만 읽습니다.</>],
  ["인쇄", <>업무 현황 상단의 [인쇄]로 진단 리포트용 표를 뽑을 수 있습니다. 메뉴·버튼은 인쇄에서 빠집니다.</>],
  ["자기 승인", <>제안 수정(<kbd>E</kbd>) 뒤 [수정안 저장]을 누르면 작성자가 기록되고, 그 사람은 승인할 수 없습니다. 승인자 이름을 소관 부서 검토자로 바꾼 뒤 승인하세요. 승인 시점의 원문 버전이 기록되며, 원문이 바뀌면 적용·결과 내려받기에서 제외됩니다.</>],
  ["사업·검수", <>사업·견적 화면은 견적 워크북(사업가정·원가견적·12개월 현금·WBS)을, 검수·관문 화면은 요구검수·오픈 관문·위험·첫 미팅 질문지를 담습니다. 입력은 이 브라우저에만 저장됩니다.</>],
  ["화면", <>왼쪽 아래(모바일은 상단)에서 자동/밝게/어둡게를 바꿀 수 있습니다.</>],
];

export default function HelpPage() {
  return (
    <div className="pb-10">
      <PageHeader title="사용 안내" sub="처음 사용하는 담당자를 위한 작업 순서와 자주 묻는 질문입니다." />
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
          <div className="eyebrow mb-1">DISPOSITIONS</div>
          <h2 className="font-semibold text-[15px] mb-1">정비 결정과 보존 정책 — 삭제가 아니라 「어떤 맥락에서 어디에 남길 것인가」</h2>
          <p className="text-[12px] text-muted mb-2">기획서 13장의 7가지 판정과 이 앱의 처분 값. 삭제/폐기는 기관이 정한 적법 절차로 별도 실행하며 이 앱에는 삭제 기능이 없다.</p>
          <table className="tbl">
            <thead><tr><th>판정</th><th>앱 처분</th><th>처리</th><th>필수 승인 / 증빙</th></tr></thead>
            <tbody>
              {DISPOSITION_POLICY.map((p) => (
                <tr key={p.judgement}>
                  <td className="font-medium whitespace-nowrap">{p.judgement}</td>
                  <td className="mono text-[12px] whitespace-nowrap">{p.disposition ?? "— (없음)"}</td>
                  <td className="text-[12px]">{p.action}</td>
                  <td className="text-[12px] text-muted">{p.approval}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[12px] mt-3">
            <b>승인 흐름(상태 전이)</b> — 초안(draft) → 검토 요청(submitted) → 승인(approved) → 적용(applied) → 되돌림(rolled_back). 반려(rejected)된 안은 적용할 수 없고, 새 원문/새 초안으로 재검토한다. 검토 중 원문 변경·같은 버전에서 다른 적용·권한 부족은 성공처럼 처리하지 않고 403/409로 거부한다.
          </p>
          <p className="text-[12px] mt-1">
            <b>6개 안내 필드</b> — {SIX_FIELDS.join(" · ")}. 원문에 없는 값은 null. 신규 수수료·기한은 메모로 추가하지 않고 승인된 새 원문을 등록해 버전을 올린 뒤 다시 초안을 만든다.
          </p>
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
            위생관리 앱 v0.3 · 짝 문서: 기획서 v0.1 · 구성명세서 v0.1 (2026-09-21) · ContentCare 사업개발기획서·사업운영 견적(2026-09-21) · 핸드북 v1.0 (강의일 2026-09-18)
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
