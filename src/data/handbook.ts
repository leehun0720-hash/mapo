// 짝 앱 「마포구청 AI 웹핸드북」(https://mapo-ai-handbook.vercel.app) 과의 연결 정보.
// 핸드북 = 왜·무엇을(강의·시장조사·과별 도구), 위생관리 앱 = 어떻게(전수 스캔·승인·산출물).

export const HANDBOOK_URL = "https://mapo-ai-handbook.vercel.app";
export const TENAI_URL = "https://www.tenai.kr";

export const HANDBOOK_LINKS = {
  home: `${HANDBOOK_URL}/#/`,
  diagnosis: `${HANDBOOK_URL}/#/ch/diagnosis`,
  scorecard: `${HANDBOOK_URL}/#/ch/scorecard`,
  areaContent: `${HANDBOOK_URL}/#/ch/area-3-content`,
  roadmapKpi: `${HANDBOOK_URL}/#/ch/roadmap-kpi`,
  regulation: `${HANDBOOK_URL}/#/ch/regulation`,
  toolPii: `${HANDBOOK_URL}/#/tools/pii`,
  toolKpi: `${HANDBOOK_URL}/#/tools/kpi`,
  toolRfp: `${HANDBOOK_URL}/#/tools/rfp`,
  depts: `${HANDBOOK_URL}/#/depts`,
  glossary: `${HANDBOOK_URL}/#/glossary`,
  manual: `${HANDBOOK_URL}/#/manual`,
} as const;

export interface HandbookChapter {
  key: keyof typeof HANDBOOK_LINKS;
  part: string;
  title: string;
  why: string; // 위생관리 앱과의 관계
}

export const HANDBOOK_CHAPTERS: HandbookChapter[] = [
  { key: "diagnosis", part: "PART 1 · 04", title: "진단 ①~④ — 콘텐츠·검색·다국어·예산 구조", why: "이 앱의 회귀 사례 F1~F9가 나온 관찰. 진단 ① 콘텐츠 위생 표와 D1~D5가 1:1로 대응" },
  { key: "scorecard", part: "PART 1 · 05", title: "진단 요약과 현장 테스트 10문항", why: "10문항 중 2개(민선8기·코로나)는 낡은 페이지 함정. D3 이슈에 '평가셋 함정' 태그로 표시" },
  { key: "areaContent", part: "PART 3 · 11", title: "영역 ③ 콘텐츠 정비 · 지식베이스 — 실행 순서 1번", why: "네 가지 과업(위생·구조화·쉬운 우리말·신선도 감시)과 측정 지표. 대시보드의 과업 카드가 이 장을 따른다" },
  { key: "roadmapKpi", part: "PART 5 · 16", title: "4억 배분 · 12개월 로드맵 · KPI 8개", why: "KPI ⑦ 콘텐츠 신선도는 이 앱이 매주 산출. 31~90일 '콘텐츠 정비 1차 내부 착수'가 이 앱의 MVP 구간" },
  { key: "regulation", part: "PART 5 · 15", title: "제도 6가지 · 범정부 공통기반 · 조달", why: "N2SF O등급 상정, CSAP 리전, 기록물(고시공고) 보존 원칙의 근거" },
];

/** 영역 ③ 네 가지 과업 ↔ 이 앱의 탐지기·산출물 */
export const FOUR_TASKS = [
  { no: 1, name: "위생", detectors: ["D1", "D2", "D5", "D8", "D9"], desc: "canonical·title 템플릿·하위 도메인 중복·URL 파라미터·보관/폐기 규칙", output: "canonical 맵 · 301 맵 · title 수정 목록 · noindex 목록" },
  { no: 2, name: "구조화", detectors: ["D6"], desc: "고시공고·민원 안내를 '대상–준비물–수수료–처리기간–담당–링크' 구조로", output: "구조화 초안(AI, 필드별 인용) · 수정 요청서" },
  { no: 3, name: "쉬운 우리말", detectors: [], desc: "고시문 원문 옆 AI 요약본(국립국어원 공공언어 기준)", output: "파일럿 7주차 P5 요약 초안 (이 표본에는 없음)" },
  { no: 4, name: "신선도 감시", detectors: ["D3", "D4", "D7"], desc: "90일 미갱신·끊어진 링크·담당자 변경 페이지를 자동으로 찾아 부서에 알림", output: "주간 증분 스캔 · KPI ⑦ · 매니페스트 갱신" },
] as const;

/** 영역 ③ 측정 지표 — 챗봇 정확도의 선행 지표 */
export const CONTENT_KPI_TARGETS = [
  { key: "stale90d", name: "90일 미갱신 페이지 수", goal: "지속 감소" },
  { key: "dupRate", name: "중복 페이지율", goal: "지속 감소" },
  { key: "titleErrors", name: "title 오류 건수", goal: "0건" },
  { key: "structuredRatio", name: "구조화된 민원 안내 비율", goal: "지속 증가" },
] as const;

/** 핸드북 KPI 8개 중 이 앱이 직접 산출하는 것 */
export const KPI8_FROM_THIS_APP = { index: 7, name: "콘텐츠 신선도(90일 미갱신 페이지)", how: "크롤링 점검", goal: "감소 추세" };

/** 현장 테스트 10문항 중 이 앱과 직접 연결되는 문항 (핸드북 quiz10) */
export const QUIZ_LINKS: Record<string, { q: string; tag: string }> = {
  passport: { q: "여권 재발급 준비물과 수수료, 소요기간은?", tag: "1번 · 고빈도 민원 (연 37,633건)" },
  vision8: { q: "민선8기 마포구 비전이 뭐예요?", tag: "9번 · 함정 — 낡은 페이지 검증" },
  covid: { q: "코로나 확진자 이동경로 알려줘", tag: "10번 · 함정 — 폐기 콘텐츠 검증" },
};

/** 12개월 로드맵에서 이 앱이 맡는 구간 */
export const ROADMAP = [
  { when: "0~30일 · 2026.9~10", what: "측정과 준비", mine: "표본 스캔(S4) → 회귀 사례 재확인, 과업지시서용 수치" },
  { when: "31~90일 · 2026.11~12", what: "발주와 1차 정비", mine: "MVP 2주 진단 → 1차 위생 리포트, 매니페스트 v0, 인덱싱 범위(우선 15개 사이트)" },
  { when: "3~6개월 · 2027.1~3", what: "파일럿", mine: "화면 5종 운영, 주간 감시, 구조화 초안, 벤더 매니페스트 API" },
  { when: "6~9개월 · 2027.4~6", what: "정식 오픈과 공개", mine: "KPI ⑦ 월간 공개, 2027.6 행정사무감사 수치" },
  { when: "9~12개월 · 2027.7~9", what: "고도화", mine: "월간 감시 구독, 다기관 확장" },
];

/** 승인자를 위한 다섯 원칙 — 핸드북 '공무원 AI 사용 5원칙'을 이 앱의 승인 흐름에 맞춰 옮김 */
export const APPROVER_RULES = [
  ["AI 초안은 초안입니다", "title 제안·낡음 판정·구조화 초안·사실 충돌 정답 후보는 모두 AI 초안입니다. 인용 근거가 본문에 실재하는지 보고 승인합니다."],
  ["개인정보는 화면에서도 가립니다", "D8 이슈는 마스킹본만 저장·표시됩니다. 원문 확인은 원본 페이지에서 담당자가 직접 하고, 첨부는 즉시 교체합니다."],
  ["삭제는 제안하지 않습니다", "고시공고·공지는 기록물입니다. 처분은 갱신·보관(색인 제외)·유지 중에서 고르고, 폐기 여부는 담당 부서가 결정합니다."],
  ["정밀도 90% 미만은 관찰입니다", "'관찰' 탭의 이슈는 자동 제안이 아닙니다. 반려하면 골드셋 후보로 쌓여 다음 측정에 쓰입니다."],
  ["측정 방법을 먼저 공개합니다", "위생 점수 산식과 KPI 정의는 대시보드에 그대로 적혀 있습니다. 숫자보다 먼저 산식을 부서와 공유합니다."],
] as const;

export const FAQ = [
  ["승인·반려한 내용은 어디에 저장되나요?", "이 시연본은 서버가 없는 정적 배포라 승인·규칙·대표 URL 변경이 모두 사용 중인 브라우저(localStorage)에만 저장됩니다. 파일럿에서는 API(PostgreSQL)에 기록되고 승인 이력이 감사 로그로 남습니다."],
  ["표본 데이터는 실제 마포구 홈페이지 데이터인가요?", "아닙니다. 강의안(2026-09-12 색인 관찰)과 구성명세서의 회귀 사례 F1~F9를 재현하도록 만든 설명용 표본입니다. URL·수치는 첫 크롤에서 확정합니다."],
  ["'자동 제안'과 '관찰'의 차이는?", "골드셋 정밀도 90% 이상인 탐지기 코드만 자동 제안입니다. 측정 전에는 규칙 기반(D1 exact, D2 T1~T3, D5, D8)만 자동 제안이고 나머지는 관찰입니다."],
  ["매니페스트를 벤더에게 어떻게 넘기나요?", "내보내기에서 벤더 읽기 전용 토큰을 발급하고 GET /api/exports/manifest.json 주소를 전달합니다. 벤더는 include만 색인하고, alias_urls는 canonical_url로 바꿔 출처를 표기합니다."],
  ["부서 이름이 조직도와 다릅니다.", "2026.8.14 민선9기 첫 조직개편(8국→7국, 2담당관 37과) 기준으로 맞췄습니다. 담당부서 표기가 옛 이름이면 D3_ORG_MISMATCH 이슈로 잡힙니다."],
  ["핸드북과 이 앱은 어떻게 다른가요?", "핸드북은 '왜·무엇을'(강의·시장조사·과별 프롬프트), 이 앱은 '어떻게'(전수 스캔·승인·산출물)입니다. 핸드북 영역 ③의 네 가지 과업을 이 앱이 실행합니다."],
] as const;

export const GLOSSARY: [string, string][] = [
  ["콘텐츠 위생", "중복·오표기·낡음·충돌 없이 AI가 읽어도 되는 상태로 콘텐츠를 유지하는 일."],
  ["RAG (검색증강생성)", "AI가 답하기 전에 기관의 문서를 먼저 검색해 그 내용을 근거로 답하게 하는 방식. 홈페이지 챗봇의 표준 구조."],
  ["매니페스트", "어떤 문서를 인덱스에 넣고(include)·빼고(exclude)·보류(hold)할지, 대표 URL은 무엇인지 적은 목록 파일."],
  ["canonical 태그", "같은 내용의 페이지가 여러 주소로 열릴 때 '대표 주소'를 알려 주는 HTML 표시."],
  ["301 리다이렉트", "옛 주소로 들어오면 새 주소로 자동으로 보내는 설정."],
  ["보관(아카이브)", "삭제하지 않고 '지난 자료'로 표시한 뒤 검색·AI 색인에서만 빼는 것."],
  ["골드셋", "사람이 정답을 달아 둔 평가용 표본. 탐지기별 300건으로 정밀도를 잰다."],
  ["정밀도", "앱이 문제라고 한 것 중 실제 문제인 비율. 90% 미만이면 '관찰' 등급."],
  ["평가셋", "정답을 아는 질문 묶음(200문항). 같은 문제로 매달 재면 개선 여부를 숫자로 말할 수 있다."],
  ["환각 (할루시네이션)", "AI가 사실이 아닌 내용을 그럴듯하게 지어내는 현상. 이 앱은 인용이 본문에 실재하는지 코드로 검증한다."],
  ["임베딩", "문장을 의미 기반의 숫자 벡터로 바꾸는 것. D2 T5·D7 대상 묶기에 쓴다."],
  ["MinHash / LSH", "긴 문서를 짧은 지문으로 줄여 거의 같은 문서를 빠르게 찾는 기법. D1 near 클러스터의 기초."],
  ["N2SF", "국가 망 보안체계. 공개(O) 웹페이지만 다루므로 O등급을 상정하되 정보통신팀과 합의가 필요하다."],
  ["CSAP", "클라우드 보안인증. 기관 납품·운영은 CSAP 인증 리전에서."],
  ["AI 초안", "AI가 만든 제안. 원문 근거가 붙어 있으며 사람이 확인한 뒤에만 반영."],
  ["회귀 사례", "2026-09-12 강의안에서 관찰된 문제(F1~F9). 고쳐진 뒤 재발하는지 계속 확인한다."],
];

export const UPDATES = [
  ["2026-09-22", "ContentCare 사업 체계 반영: 사업·견적 화면(상품 4종·원가 견적 계산·12개월 현금·90일 WBS), 검수·관문 화면(요구검수 16·오픈 관문 9·위험 10·인터뷰 10), 처분 7종·검토 주기·자기 승인 금지·버전 충돌·커버리지·knowledge.jsonl·CSV 수식 보호, D3 책임자 미입력·D9 접근성·지시문"],
  ["2026-09-21", "핸드북 연동: 디자인 체계 통일, 통합검색(/), 매뉴얼·도움말, 네 가지 과업 지도, 조직개편 후 부서명 반영"],
  ["2026-09-21", "점검 반영: 내보내기 중복 행 제거, 좁은 화면 대응, API 페이지 값 검증"],
  ["2026-09-21", "파일럿 화면 5종 + 검사 도구 + API 최초 배포"],
];
