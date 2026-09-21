// 「TenAI ContentCare 사업·개발·검수·운영 통합 기획서」(2026-09-21)와 「사업운영_견적.xlsx」의 내용.
// 가격·목표·인력·일정은 사업설계 가정이며 시장단가·수주 약정이 아니다.

export const PRODUCT_NAME = "TenAI ContentCare";
export const PRODUCT_TAGLINE = "프로그램을 납품하는 사업이 아니라, 정확한 정보가 유지되는 업무 체계를 납품하는 사업";
export const ONE_SENTENCE =
  "챗봇을 새로 만드는 사업이 아닙니다. AI와 주민이 함께 읽는 홈페이지 원문을 찾아서 정비하고, 누가 언제 승인했는지 남기는 사업입니다.";

/** 출시 상태 두 줄 (기획서 25장) */
export const RELEASE_STATUS = ["고객 시연·유료 진단용 MVP: 준비됨.", "기관 운영형 상용 배포: 고객별 구축과 검수 후 확정."] as const;

export interface Product {
  key: "diagnose" | "pilot" | "build" | "care";
  name: string;
  price: string;
  duration: string;
  scope: string;
  revenueType: string;
  sellNow: boolean;
}

export const PRODUCTS: Product[] = [
  { key: "diagnose", name: "Diagnose · 유료 진단", price: "800~1,500만원", duration: "2주", scope: "1개 사이트, 제공/승인 자료 200건 표본, 인터뷰 3회, 기준선·위험 목록·본사업 범위안. 게시 변경 없음", revenueType: "컨설팅/진단 용역", sellNow: true },
  { key: "pilot", name: "Pilot · 파일럿", price: "2,500~5,000만원", duration: "6~8주", scope: "3개 부서 이내·200건·구조화 50건, 로컬 앱 시연, 독립 검수, 전후 비교. 고객 CMS 자동 게시 제외", revenueType: "제한 범위 실증 용역", sellNow: true },
  { key: "build", name: "Build SI · 본사업", price: "6,000만원~1.2억원", duration: "8~12주 이후 협의", scope: "예시: 5,000 URL 목록화 + 정비 1,000건 + HTML 템플릿 5종 + CMS 1종. MVP 확장 개발 필요", revenueType: "구축/데이터 정비 용역", sellNow: false },
  { key: "care", name: "Care · 월간 운영", price: "월 150~400만원", duration: "연간 계약 권고", scope: "예시 월 250만원: 정비 40건·원격지원 8시간·월간 보고 1회. API/인프라 예산 상한 별도", revenueType: "운영 서비스/유지관리", sellNow: false },
];

export const WORK_UNITS = "「문서 1건」은 독립 URL 또는 CMS 게시물 1개. 첨부파일 1개, 스캔 1페이지, 표 1개, 언어 1종, 템플릿 1종, CMS 커넥터 1종은 별도 단위. 정비 대상 추가·검토 반복·다국어·기관 승인 대기는 자동 포함하지 않음. 기본 수정 2회.";
export const EXCLUDED_TASKS = ["전면 홈페이지 리뉴얼", "챗봇 자체 개발", "비공개 업무망 연결", "법률 유효성 보증", "접근성 인증비", "HWP/PDF 상용 파서·대량 OCR", "고가용성·재해복구·SSO", "24시간 운영"];

export interface WbsItem {
  id: string;
  task: string;
  owner: string;
  start: number;
  end: number;
  precondition: string;
  deliverable: string;
  extra?: boolean; // 현재 MVP에 없는 상용 기능(추가 구축)
}

export const WBS: WbsItem[] = [
  { id: "W01", task: "유료 진단 제안·인터뷰", owner: "대표/PM", start: 1, end: 2, precondition: "착수 전", deliverable: "승인 주체·200건 범위·예산 경로" },
  { id: "W02", task: "자료 처리·수집 승인", owner: "고객/보안", start: 1, end: 2, precondition: "W01", deliverable: "반출·보존·재위탁 조건 서명" },
  { id: "W03", task: "목록화·정답 라벨·기준선", owner: "콘텐츠/QA", start: 2, end: 3, precondition: "W02", deliverable: "수집 실패 포함 목록·평가셋 버전" },
  { id: "W04", task: "규칙·분류·우선순위 합의", owner: "PM/부서", start: 3, end: 4, precondition: "W03", deliverable: "오탐·누락 기준·보존 예외 합의" },
  { id: "W05", task: "시범 앱 설치·계정 분리", owner: "개발", start: 3, end: 4, precondition: "W02", deliverable: "제공 MVP 설치·권한 테스트" },
  { id: "W06", task: "파일럿 정비·근거 작성", owner: "콘텐츠", start: 4, end: 6, precondition: "W04/W05", deliverable: "200건 점검·50건 구조화(제안)" },
  { id: "W07", task: "담당부서 검수·오탐 조정", owner: "고객/QA", start: 5, end: 7, precondition: "W06", deliverable: "승인/반려 기록·정본 확정" },
  { id: "W08", task: "본사업 범위·추가견적 확정", owner: "대표/고객", start: 7, end: 8, precondition: "W07", deliverable: "정량 결과·별도 상용화 범위" },
  { id: "W09", task: "CMS API·스테이징 연동", owner: "CMS협력사", start: 8, end: 10, precondition: "별도 SI 계약", deliverable: "버전잠금·적용·복구", extra: true },
  { id: "W10", task: "운영 DB·큐·SSO·부서 ACL", owner: "개발/보안", start: 8, end: 11, precondition: "별도 SI 계약", deliverable: "상용 운영 환경", extra: true },
  { id: "W11", task: "원문·첨부 파서 고도화", owner: "데이터개발", start: 8, end: 11, precondition: "샘플·라이선스 승인", deliverable: "HWP/PDF·표·격리", extra: true },
  { id: "W12", task: "보안·접근성·현장 UAT", owner: "독립검수/고객", start: 10, end: 12, precondition: "W09~11", deliverable: "실기관 증빙·미결 이슈 승인" },
  { id: "W13", task: "운영자 교육·인수인계", owner: "PM/고객", start: 12, end: 13, precondition: "W12", deliverable: "책임자·복구·평가·오픈 승인" },
  { id: "W14", task: "월간 운영계약 시작", owner: "운영/고객", start: 13, end: 13, precondition: "W13", deliverable: "변경량·지원시간·SLA 계약" },
];

export type WbsStatus = "미착수" | "진행" | "완료" | "보류";
export const WBS_STATUSES: WbsStatus[] = ["미착수", "진행", "완료", "보류"];

export type ReqStatus = "검증됨" | "미검증" | "미구현" | "미확정";
export interface Requirement {
  id: string;
  text: string;
  priority: "P0" | "P1";
  kind: "MVP 구현" | "어댑터만 구현" | "추가 개발" | "현장 검수" | "운영 과업";
  acceptance: string;
  status: ReqStatus;
  evidence: string;
  /** 이 웹앱(위생관리 화면)에서의 대응 */
  here?: string;
}

export const REQUIREMENTS: Requirement[] = [
  { id: "REQ01", text: "HTML/TXT·JSON 등록", priority: "P0", kind: "MVP 구현", acceptance: "200건/1MB 문서/2MB 요청 경계값", status: "검증됨", evidence: "자동 테스트 / 가상 자료", here: "표본 44건 정적 등록(시연)" },
  { id: "REQ02", text: "유형별 검토기한·만료", priority: "P0", kind: "MVP 구현", acceptance: "미입력≠낡음, 보존기록≠삭제", status: "검증됨", evidence: "규칙 단위시험", here: "규칙 편집 → 검토 주기, D3 신호" },
  { id: "REQ03", text: "중복·유사 후보", priority: "P0", kind: "MVP 구현", acceptance: "PII 마스킹 문서 자동 통합 금지", status: "검증됨", evidence: "샘플 단위시험", here: "D1 클러스터, 자동 병합 없음" },
  { id: "REQ04", text: "구조화·원문 인용", priority: "P0", kind: "MVP 구현", acceptance: "6필드, 없는 값 null, 근거 불일치 거부", status: "검증됨", evidence: "단위/API 시험", here: "D6 증거 패널 6필드 표" },
  { id: "REQ05", text: "LLM 실연결 품질", priority: "P0", kind: "어댑터만 구현", acceptance: "선정 모델별 평가셋·API·비용 측정", status: "미검증", evidence: "mock 시험만 통과" },
  { id: "REQ06", text: "작성자와 승인자 분리", priority: "P0", kind: "MVP 구현", acceptance: "관리자 포함 자기 승인 금지", status: "검증됨", evidence: "API·화면 흐름", here: "이슈 큐: 수정안 작성자는 승인 불가" },
  { id: "REQ07", text: "버전 충돌·로컬 되돌림", priority: "P0", kind: "MVP 구현", acceptance: "승인 후 원문 변경 시 적용 거부", status: "검증됨", evidence: "API 시험", here: "승인 기준 버전 ≠ 현재 버전이면 내보내기 제외" },
  { id: "REQ08", text: "고객 CMS 실제 반영", priority: "P0", kind: "추가 개발", acceptance: "버전/백업/적용/검증/롤백 실기관 시험", status: "미구현", evidence: "협력사·고객 API 필요" },
  { id: "REQ09", text: "HWP/PDF·표·OCR", priority: "P1", kind: "추가 개발", acceptance: "원문 페이지·셀 좌표, 수치 일치", status: "미구현", evidence: "파서 계약·스캔 샘플 필요" },
  { id: "REQ10", text: "법령·수수료 진위 대조", priority: "P1", kind: "추가 개발", acceptance: "공식 정본·시행일·예외 확인", status: "미구현", evidence: "AI 인용만으로 충족 불가" },
  { id: "REQ11", text: "대규모·증분·스케줄링", priority: "P0", kind: "추가 개발", acceptance: "사이트 5000URL·일일작업·재시도", status: "미구현", evidence: "큐·배치·모니터링 추가" },
  { id: "REQ12", text: "SSO/MFA·부서별 ACL", priority: "P0", kind: "추가 개발", acceptance: "역할×부서 권한행렬 전수시험", status: "미구현", evidence: "고객별 별도 설치가 현재 대안" },
  { id: "REQ13", text: "보안·개인정보 심사", priority: "P0", kind: "현장 검수", acceptance: "외부 반출·위탁·취약점·로그·암호화", status: "미검증", evidence: "기관 담당·전문가 승인 필요" },
  { id: "REQ14", text: "접근성 수동 평가", priority: "P0", kind: "현장 검수", acceptance: "키보드·스크린리더·명도·수동 점검", status: "미검증", evidence: "자동 검사로 인증 대체 불가" },
  { id: "REQ15", text: "보존/폐기·종료 인수인계", priority: "P0", kind: "운영 과업", acceptance: "기록 보존 결정·반환·삭제 증명", status: "미확정", evidence: "고객 기록/개인정보 책임자" },
  { id: "REQ16", text: "CSV/JSON/JSONL 내보내기", priority: "P0", kind: "MVP 구현", acceptance: "미승인·기한만료 등 필터·CSV 수식 보호", status: "검증됨", evidence: "API 시험", here: "내보내기: CSV 수식 보호, knowledge.jsonl" },
];

export interface Gate {
  id: string;
  gate: string;
  evidence: string;
  current: string;
}

export const OPEN_GATES: Gate[] = [
  { id: "G1", gate: "사업범위·권리", evidence: "서명된 SOW·처리/수집 승인·IP/재위탁·지급 조건", current: "양식 제공, 고객 미확정" },
  { id: "G2", gate: "실데이터 평가", evidence: "정답셋·유형별 성능·원문 수치/기간 검수", current: "미수행" },
  { id: "G3", gate: "모델 연결", evidence: "기관 승인 공급자·저장정책·API·비용·실품질", current: "어댑터/mock만 시험" },
  { id: "G4", gate: "접근통제", evidence: "조직/부서 권한·SSO/MFA·키 정책·점검", current: "로컬 개인키만 구현" },
  { id: "G5", gate: "운영 보안", evidence: "네트워크·송신·로그·암호화·취약점·SBOM", current: "기본 통제, 전문 검수 미수행" },
  { id: "G6", gate: "CMS 적용", evidence: "고객 시험계정·버전 잠금·백업·소량 적용·복구", current: "미구현" },
  { id: "G7", gate: "품질·접근성", evidence: "사용자 UAT·키보드/스크린리더·장애 대응", current: "소프트웨어/격리 UI 시험만 수행" },
  { id: "G8", gate: "보존·종료", evidence: "보존분류·공개중단·파기·반환·삭제·이관", current: "설계/양식, 기관 결정 필요" },
  { id: "G9", gate: "운영체계", evidence: "교육·책임자·SLA·예산·모니터링·인수 서명", current: "설계/양식 제공" },
];

export const PILOT_MIN_CONDITIONS = ["고객 1곳, 별도 설치", "민감정보를 제외한 승인된 200건 이내 자료", "운영 사이트 쓰기 권한 없음", "소관 부서 검토자 지정", "목적·보존·반출 합의", "실패/한계가 표시된 결과보고"];

export interface Risk {
  id: string;
  risk: string;
  priority: "높음" | "보통";
  owner: string;
  response: string;
  evidence: string;
}

export const RISKS: Risk[] = [
  { id: "R01", risk: "무단 수집·반출", priority: "높음", owner: "보안/고객", response: "서면 범위 승인, 기본 차단, 승인 IP/도메인", evidence: "승인서" },
  { id: "R02", risk: "공공 기록 자동 삭제", priority: "높음", owner: "기록 담당", response: "현행 제외와 보존·폐기를 분리; MVP 삭제 없음", evidence: "처분 결정서" },
  { id: "R03", risk: "수수료·기한 환각", priority: "높음", owner: "소관 부서", response: "원문 근거·정본대조·독립 검수, null 허용", evidence: "원문/검토 기록" },
  { id: "R04", risk: "CMS 변경 장애", priority: "높음", owner: "CMS 협력사", response: "스테이징, 버전 잠금, 백업, 소량 배포, 복구", evidence: "복구 시험" },
  { id: "R05", risk: "승인 지연·무한 정비", priority: "높음", owner: "PM/고객", response: "주당 검토량·응답 기한·2회 수정·초과단가", evidence: "SOW/변경요청" },
  { id: "R06", risk: "저가 수주·수금 지연", priority: "높음", owner: "대표", response: "인일 원가·예비비·단계 수금·최소 현금 확보", evidence: "원가/현금표" },
  { id: "R07", risk: "개인정보 탐지 누락", priority: "높음", owner: "개인정보 책임", response: "수동 표본·전문 DLP, 민감 자료 배제", evidence: "누락 평가" },
  { id: "R08", risk: "상용 파서·모델 라이선스", priority: "보통", owner: "기술/법무", response: "버전별 SBOM·상업/재배포 조건 확인", evidence: "라이선스 대장" },
  { id: "R09", risk: "운영형 과대 약속", priority: "높음", owner: "영업/PM", response: "MVP·본사업 기능과 검수 현황을 제안서 구분", evidence: "기능 매트릭스" },
  { id: "R10", risk: "제품 핵심 코드 권리", priority: "보통", owner: "법무/대표", response: "기존 IP·고객 결과물·개선코드 권리 별도 합의", evidence: "권리 부속서" },
];
export type RiskStatus = "대기" | "대응중" | "닫힘" | "수용";
export const RISK_STATUSES: RiskStatus[] = ["대기", "대응중", "닫힘", "수용"];

export interface InterviewQ {
  id: string;
  topic: string;
  question: string;
  evidence: string;
}

export const INTERVIEW: InterviewQ[] = [
  { id: "I01", topic: "고객/수요", question: "지금 잘못된 안내 때문에 발생하는 업무와 실제 사례는?", evidence: "담당 부서·발생량·원문 증빙" },
  { id: "I02", topic: "구매", question: "최종 승인자·예산 담당자·계약 방식·의사결정 시점은?", evidence: "예산 확정과 제안 단계를 구분" },
  { id: "I03", topic: "범위", question: "사이트·도메인·게시판·문서 건수와 언어별 범위는?", evidence: "페이지와 첨부파일/스캔 페이지 별도" },
  { id: "I04", topic: "접근", question: "관리 권한·API·CMS 공급사·스테이징 환경은?", evidence: "서면 승인과 기존 계약 확인" },
  { id: "I05", topic: "보안", question: "자료 분류·외부 AI 반출·공급자 저장·재학습 조건은?", evidence: "개인정보/보안 책임자 서명" },
  { id: "I06", topic: "보존", question: "공개 중단·검색 제외·보존·폐기 판단 주체는?", evidence: "기록물/개인정보 보존 규칙" },
  { id: "I07", topic: "정본", question: "기관명·부서·수수료·기간·법령의 공식 정본은?", evidence: "시행일·개정이력·정본 담당" },
  { id: "I08", topic: "검수", question: "부서별 주당 검토 가능 건수·검토 기한은?", evidence: "승인 대기 병목/초과 견적" },
  { id: "I09", topic: "성과", question: "현행 오류율·갱신 시간·민원 재문의의 기준선은?", evidence: "없으면 진단 단계에서 측정" },
  { id: "I10", topic: "운영", question: "변경량·서비스 시간·장애 대응·예산·종료 조건은?", evidence: "월 정비량/인프라/API 상한" },
];

export const QUALIFICATION_RULE = "고객이 「AI가 알아서 수정하라」고 하면서 승인 담당자를 지정하지 않거나, CMS 운영사의 협력이 없고, 보안·자료 제공 권한이 해결되지 않았다면 본사업 고정가 견적을 보류합니다. 담당자 없는 정비 사업은 납품 완료를 판정할 수 없습니다.";

export const RACI: { task: string; a: string; r: string; c: string }[] = [
  { task: "사업범위·일정·검수", a: "고객 PM", r: "TenAI PM", c: "계약·부서 책임자" },
  { task: "원문 사실·정본 결정", a: "소관 부서 책임자", r: "부서 게시 담당", c: "TenAI 콘텐츠 담당" },
  { task: "정비 초안·근거", a: "TenAI PM", r: "콘텐츠/AI 작업자", c: "소관 부서" },
  { task: "개인정보·반출", a: "고객 개인정보 책임자", r: "고객 보안/법무", c: "TenAI 보안 담당" },
  { task: "보존·공개 중단·폐기", a: "고객 기록/정책 책임자", r: "기관 지정 담당", c: "소관 부서·법무" },
  { task: "CMS 시험/운영 반영", a: "고객 시스템 책임자", r: "CMS 운영사", c: "TenAI 개발·QA" },
  { task: "성능 평가·인수", a: "고객 검수 책임자", r: "독립 QA", c: "소관 부서·TenAI" },
  { task: "월간 운영·사고 대응", a: "고객 서비스 책임자", r: "계약된 운영팀", c: "보안·CMS사" },
];

export const THREE_LAYERS = [
  ["프로그램 검수", "권한과 상태 전이가 요구대로 작동하는지 확인"],
  ["데이터 검수", "정비된 내용과 원문·공식 정본이 일치하는지 확인"],
  ["업무 검수", "담당자가 지속적으로 검토·승인·인수할 수 있는지 확인"],
] as const;

export const SLA = {
  monthly: "월 250만원 예시: 정비 40건 · 원격 지원 8시간 · 업무일 09:00~18:00 · 월간 보고 1회",
  response: [
    ["긴급(정보 유출/잘못된 대규모 게시)", "접수 응답 1영업시간"],
    ["중요", "4영업시간"],
    ["일반", "2영업일"],
  ],
  note: "실제 복구시간은 외부 CMS·고객 승인·원인에 따라 별도 목표를 합의. 24시간 지원은 별도 인력·요금이 없으면 약속하지 않음. 가용성 99.9%·RPO 24시간·RTO 8시간은 상용 설계 목표이며 현재 로컬 앱의 보증값이 아님.",
  incident: ["작업 중지·키 폐기/송신 차단", "영향 자료·버전·승인·범위 확인", "고객 보안/개인정보 책임자 즉시 보고", "보존할 증거 확보", "고객 승인 롤백", "법정 통지·신고 해당 여부 전문가 판단", "재발방지·회귀시험", "승인 후 재개"],
  cycle: [
    ["매일/업무일", "실패 수집·긴급 후보·승인 대기·키/배포 오류 확인", "운영 이슈 큐, 담당자 통지"],
    ["매주", "신규·변경 문서·정본 이견·검수 밀림 검토", "주간 처리/미결·변경요청 목록"],
    ["매월", "커버리지·오탐·누락 표본·기한 초과·정비량·비용 보고", "월간 KPI와 다음달 작업 계획"],
    ["분기", "역할·키·보존·복구·모델/파서 버전·정답셋 재점검", "권한/복구 기록·갱신된 평가 결과"],
    ["계약 종료", "데이터·승인 원장·설계·계정·라이선스 인계", "인수확인·반환/삭제 증빙·잔여 보존 목록"],
  ],
};

/** 검토 주기 제안값 — 법정 갱신 기한이나 자동 삭제 기준이 아니다 (기획서 2장) */
export const REVIEW_PERIODS_DEFAULT = { notice: 30, guide: 90, policy: 180, record: 365 } as const;
export const REVIEW_PERIOD_LABELS: Record<keyof typeof REVIEW_PERIODS_DEFAULT, string> = {
  notice: "공고",
  guide: "상시 안내",
  policy: "정책",
  record: "보존 기록",
};

/** 정비 결정과 보존 정책 (기획서 13장) — 앱의 처분 값과 대응 */
export const DISPOSITION_POLICY: { judgement: string; disposition: string | null; action: string; approval: string }[] = [
  { judgement: "유지", disposition: "keep", action: "현재 안내 유지, 검토일·담당자만 확인", approval: "소관 부서 사실 확인" },
  { judgement: "수정", disposition: "update", action: "제목·본문·준비물·비용·기간을 승인 원문에 따라 수정 (title만이면 retitle)", approval: "근거 URL·시행일·차이·검토자" },
  { judgement: "병합", disposition: "merge", action: "정본 1개를 지정하고 중복 문서를 연결/통합 (301은 redirect)", approval: "소관 부서 동의·URL 영향·링크 재검증" },
  { judgement: "현행 제외", disposition: "exclude_index", action: "현행 메뉴/검색/RAG에서 제외하되 보존 컬렉션 유지", approval: "공개정책·기록 담당 결정" },
  { judgement: "기록 보존", disposition: "archive", action: "과거 시점·종료 안내를 표시하고 보존 체계로 이관", approval: "보존 기한·책임자·위치" },
  { judgement: "삭제/폐기", disposition: null, action: "기관이 정한 적법 절차에 따라 별도 실행 — 이 앱에는 삭제 기능이 없다", approval: "기록/개인정보/법무 승인, 보존 의무·법적 보류 확인" },
  { judgement: "보류", disposition: "(상태: 보류)", action: "근거 부족·부서 이견·법적 분쟁·수집 실패", approval: "사유·담당자·해결 기한·잔여 위험" },
];

/** 6개 안내 필드 (기획서 3·12·14장) */
export const SIX_FIELDS = ["대상", "준비물", "수수료", "처리기간", "담당부서", "신청 링크"] as const;

export const MVP_BOUNDARY: { item: string; mvp: string; commercial: string }[] = [
  { item: "입력·정규화", mvp: "HTML/TXT·JSON, 프로젝트당 200건", commercial: "대규모 증분 수집·페이지네이션·작업 큐" },
  { item: "첨부파일", mvp: "미구현", commercial: "HWP/HWPX/PDF·표·OCR·검역·라이선스" },
  { item: "AI 구조화", mvp: "규칙 추출 + 선택형 LLM 어댑터", commercial: "실모델 연결·품질/비용 평가·쉬운말 초안" },
  { item: "검토·승인", mvp: "역할 분리·자기승인 차단·버전 충돌", commercial: "부서 ACL·고객 SSO/MFA·검토 SLA" },
  { item: "수정·되돌림", mvp: "앱 내부 사본만 버전 추가", commercial: "CMS별 어댑터·실사이트 테스트·재색인" },
  { item: "신선도 관리", mvp: "기준일별 수동 재진단", commercial: "스케줄·알림·기한 관리·부서 변경 연동" },
  { item: "보안", mvp: "기본 키 인증·패턴 처리·수집 제한·HMAC 로그", commercial: "전문 점검·암호화/KMS·외부 불변 로그·관제" },
  { item: "인증·운영 승인", mvp: "없음", commercial: "기관 보안·개인정보·접근성·조달 요건 검수" },
];

export const QUALITY_TARGETS: { metric: string; how: string; goal: string }[] = [
  { metric: "점검 커버리지", how: "성공 점검 건 ÷ 합의 대상 건. 실패 별도", goal: "≥95%, 실패 목록 100% 설명" },
  { metric: "탐지 정밀도", how: "확인된 실제 오류 TP ÷ 전체 탐지 TP+FP", goal: "유형별 ≥90% 제안" },
  { metric: "탐지 재현율", how: "탐지한 실제 오류 TP ÷ 전체 실제 오류 TP+FN", goal: "유형별 ≥85% 제안" },
  { metric: "구조 필드 일치", how: "정답 필드 일치 ÷ 평가 대상 필드", goal: "수치·기한 중요 필드 ≥98% 제안" },
  { metric: "근거 추적률", how: "원문 위치·버전·인용이 연결된 비어있지 않은 값 비율", goal: "100% 설계 목표" },
  { metric: "승인 통제", how: "자기 승인·권한 위반·미승인 적용 시도", goal: "테스트에서 허용 0건" },
  { metric: "변경 안전", how: "승인 버전 충돌·복구 시험·현재 버전 확인", goal: "필수 시나리오 전부 통과" },
  { metric: "운영 효율", how: "동등 난이도 작업의 수동/도구 처리시간", goal: "파일럿 기준선 대비 측정, 절감 보장 없음" },
];

export const PROCESS_STEPS: { no: string; owner: string; doing: string; output: string }[] = [
  { no: "01 자격 판정", owner: "대표·고객 PM", doing: "문제·예산·담당자·CMS·계약 일정 확인", output: "인터뷰지, 구매자 지도. 승인 주체 없으면 중단" },
  { no: "02 범위·보안 합의", owner: "고객·보안·법무", doing: "대상 도메인·건수·분류·수집 방법·반출·보존 확정", output: "SOW, 처리/수집 승인서, 데이터 흐름도" },
  { no: "03 착수·역할 배정", owner: "PM·부서", doing: "검토자/게시자 분리, 주간 회의·산출물 일정 확정", output: "RACI, 연락망, 변경관리 절차" },
  { no: "04 자산 목록화", owner: "데이터 담당", doing: "제공 파일·CMS ID·URL·첨부·중복·실패 분리", output: "콘텐츠 대장, 수집 로그, 누락/예외 목록" },
  { no: "05 기준선·정답셋", owner: "QA·소관 부서", doing: "층화 표본 라벨링, 정상/오류/보존/미확정 구분", output: "독립 평가셋, 판정 지침, 버전·해시" },
  { no: "06 진단·우선순위", owner: "앱·콘텐츠 담당", doing: "규칙+AI 후보, 근거 연결, 심각도·담당 부서 배정", output: "진단 보고서. 미점검 자료를 정상으로 세지 않음" },
  { no: "07 정비 계획", owner: "부서·기록 담당", doing: "유지/수정/병합/검색 제외/보존/폐기 후보 판정", output: "정본과 처분 결정표. AI 단독 결정 금지" },
  { no: "08 수정안 생성", owner: "작업자·AI", doing: "필드 구조화·제목·쉬운 말 초안, 원문 인용·차이 작성", output: "수정안, 근거, 영향 범위. 원문 없는 값은 null" },
  { no: "09 독립 검토", owner: "소관 부서", doing: "자격·수수료·기간·공개 범위·기록 상태 확인", output: "승인/반려/보류 및 사유. 자기 승인 금지" },
  { no: "10 시험 반영", owner: "CMS 운영사", doing: "원문 버전 비교, 백업, 소량 시험 적용, 복구 확인", output: "실행 로그·전후 화면·롤백 증빙. 충돌 시 중단" },
  { no: "11 배포·인수", owner: "고객 PM·QA", doing: "현행 페이지·링크·인덱스·권한 회귀시험·교육", output: "검수서·운영 승인서·잔여 위험·인수 목록" },
  { no: "12 운영·종료", owner: "운영자·고객", doing: "재점검·변경관리·월간 보고·보존·계약 종료 처리", output: "KPI·승인 원장·백업 복구 기록·반환/삭제 확인" },
];

export const APP_SCOPE_SENTENCE = "이 앱이 직접 수행하는 것은 「후보 진단 → 근거 초안 → 독립 승인 → 로컬 사본 반영 → 이력·내보내기」입니다. 고객 사이트 게시·검색 재색인·기록 폐기는 수행하지 않습니다.";
