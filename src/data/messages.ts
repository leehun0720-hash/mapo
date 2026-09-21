// rules/issue_messages_ko.yaml — 이슈 코드별 쉬운 말 설명 (수정 요청서·이슈 큐에서 공용)

export interface IssueMessage {
  label: string;
  what: string; // 무엇이 문제인가(쉬운 말)
  fix: string; // 이렇게 고쳐 주세요
  detectorName: string;
}

export const DETECTOR_NAMES: Record<string, string> = {
  D1: "중복",
  D2: "title",
  D3: "낡음",
  D4: "게시판 이원화",
  D5: "URL·링크",
  D6: "첨부 의존",
  D7: "사실 충돌",
  D8: "개인정보",
};

export const ISSUE_MESSAGES: Record<string, IssueMessage> = {
  D1_CROSS_HOST_DUP: {
    label: "다른 도메인에 같은 문서",
    what: "같은 내용의 페이지가 여러 도메인 주소로 열리고 검색엔진에도 각각 등록돼 있어, AI가 같은 문서를 여러 벌로 읽고 출처를 엉뚱한 주소로 표시할 수 있습니다.",
    fix: "대표 주소 하나만 남기고 나머지 주소는 대표 주소로 자동 이동(301)시키거나 canonical 태그로 대표 주소를 알려 주세요.",
    detectorName: "중복",
  },
  D1_EXACT_DUP: {
    label: "같은 사이트 안 중복",
    what: "주소만 다르고 내용이 완전히 같은 페이지가 같은 사이트 안에 여러 개 있습니다.",
    fix: "canonical 태그로 대표 주소를 지정하거나, 불필요한 주소 파라미터를 정리해 주세요.",
    detectorName: "중복",
  },
  D1_NEAR_DUP: {
    label: "거의 같은 문서",
    what: "내용이 거의 같은(조사·어미 정도만 다른) 페이지가 둘 이상 있습니다. 하나만 남기는 것이 좋은지 사람이 확인해야 합니다.",
    fix: "두 페이지를 비교해 하나로 합치거나, 서로 다른 목적이면 제목과 내용을 구분되게 고쳐 주세요.",
    detectorName: "중복",
  },
  D1_CANONICAL_MISSING: {
    label: "canonical 태그 없음",
    what: "사본이 있는 페이지인데 대표 주소를 알려 주는 canonical 태그가 없습니다.",
    fix: "페이지 head에 canonical 태그를 추가해 주세요.",
    detectorName: "중복",
  },
  D2_T1_MISSING: {
    label: "브라우저 제목 없음",
    what: "이 페이지에는 브라우저 제목(title)이 비어 있어, 검색 결과와 AI 답변의 출처에 제목이 표시되지 않습니다.",
    fix: "페이지 내용을 나타내는 제목을 '페이지명 | 상위 메뉴 | 사이트명' 형식으로 넣어 주세요.",
    detectorName: "title",
  },
  D2_T2_SITE_DEFAULT: {
    label: "제목이 사이트 이름뿐",
    what: "이 페이지의 브라우저 제목이 사이트 이름으로만 되어 있어, 검색 결과와 AI 답변의 출처에 엉뚱한 제목이 표시됩니다.",
    fix: "페이지 내용을 나타내는 제목을 '페이지명 | 상위 메뉴 | 사이트명' 형식으로 바꿔 주세요.",
    detectorName: "title",
  },
  D2_T3_MASS_SHARED: {
    label: "여러 페이지가 같은 제목(템플릿)",
    what: "서로 다른 내용의 페이지 여러 개가 똑같은 브라우저 제목을 쓰고 있습니다. 템플릿에서 제목을 고정해 둔 것으로 보입니다.",
    fix: "페이지 템플릿에서 제목을 페이지별 이름(h1)이 들어가도록 바꿔 주세요. 한 곳만 고치면 됩니다.",
    detectorName: "title",
  },
  D2_T4_H1_MISMATCH: {
    label: "제목과 본문 제목이 다름",
    what: "브라우저 제목(title)과 페이지 안의 큰 제목(h1)이 서로 다른 내용이라, 검색 결과에 다른 페이지 제목이 표시됩니다.",
    fix: "브라우저 제목을 페이지 안의 큰 제목과 같게 맞춰 주세요.",
    detectorName: "title",
  },
  D2_T5_SEMANTIC_MISMATCH: {
    label: "제목이 내용과 무관(AI 판정)",
    what: "브라우저 제목이 본문 내용과 맞지 않거나 너무 일반적이라고 AI가 판정했습니다(초안, 사람 확인 필요).",
    fix: "본문 내용을 나타내는 제목으로 바꿔 주세요.",
    detectorName: "title",
  },
  D3_EXPIRED: {
    label: "기간이 끝난 안내",
    what: "행사·접수 기간이 지났거나 상황이 끝난(예: 코로나19) 안내 페이지가 남아 있어, AI가 이 내용을 현재 정보처럼 답할 수 있습니다.",
    fix: "페이지를 보관(아카이브) 표시하고 검색·AI 색인에서 제외해 주세요. 삭제는 권하지 않습니다.",
    detectorName: "낡음",
  },
  D3_SUPERSEDED: {
    label: "새 내용으로 대체된 페이지",
    what: "이 페이지의 내용은 이후 새 계획·조직으로 대체되었습니다(예: 민선8기 → 민선9기).",
    fix: "최신 페이지로 안내하거나 보관 표시 후 색인에서 제외해 주세요.",
    detectorName: "낡음",
  },
  D3_ORG_MISMATCH: {
    label: "담당부서·전화가 옛 조직",
    what: "페이지의 담당부서 또는 전화번호가 현재 조직도에 없습니다. 조직개편 전 정보로 보입니다.",
    fix: "현재 조직도 기준으로 담당부서·전화번호를 갱신해 주세요.",
    detectorName: "낡음",
  },
  D3_REVIEW: {
    label: "낡음 여부 확인 필요",
    what: "오래됐거나 죽은 링크가 많아 낡았을 가능성이 있으나 AI도 확신하지 못했습니다(관찰 등급).",
    fix: "내용이 아직 유효한지 확인하고, 유효하면 갱신일을 표시해 주세요.",
    detectorName: "낡음",
  },
  D4_PAIR_IDENTICAL: {
    label: "구·신 게시판에 같은 글",
    what: "같은 고시공고가 옛 게시판과 새 게시판(nPortal)에 모두 있습니다. AI가 둘 중 하나를 임의로 읽습니다.",
    fix: "권위 게시판(nPortal)만 색인하고 옛 게시판 글은 별칭으로 처리합니다. 부서 조치는 없습니다.",
    detectorName: "게시판 이원화",
  },
  D4_PAIR_CONFLICT: {
    label: "구·신 게시판 내용 불일치",
    what: "같은 고시공고인데 옛 게시판과 새 게시판의 본문이 다릅니다. 어느 쪽이 맞는지 확인이 필요합니다.",
    fix: "정본을 확인하고 다른 쪽을 정정하거나 정본 안내를 붙여 주세요.",
    detectorName: "게시판 이원화",
  },
  D4_ONLY_LEGACY: {
    label: "옛 게시판에만 있는 글",
    what: "이 고시공고는 옛 게시판에만 있고 새 게시판에는 없습니다.",
    fix: "이관 여부를 결정해 주세요(목록 제공).",
    detectorName: "게시판 이원화",
  },
  D5_BROKEN_LINK: {
    label: "죽은 링크",
    what: "페이지 안의 링크가 열리지 않습니다(404 등). 6시간 뒤 재확인해도 같았습니다.",
    fix: "링크 주소를 고치거나 링크를 제거해 주세요.",
    detectorName: "URL·링크",
  },
  D5_REDIRECT_CHAIN: {
    label: "여러 번 자동 이동",
    what: "링크가 최종 페이지에 닿기까지 두 번 이상 자동 이동합니다.",
    fix: "링크를 최종 주소로 바로 연결해 주세요.",
    detectorName: "URL·링크",
  },
  D5_ESCAPE_BUG: {
    label: "주소에 &amp; 잔재",
    what: "게시판 템플릿이 링크 주소에 '&amp;'를 그대로 넣어, 같은 글이 여러 주소로 보입니다. 한 곳(템플릿)을 고치면 전체가 해결됩니다.",
    fix: "링크를 만드는 템플릿에서 HTML 이스케이프가 두 번 적용되지 않게 고쳐 주세요.",
    detectorName: "URL·링크",
  },
  D5_STATE_PARAMS: {
    label: "주소에 상태값 다수 노출",
    what: "게시글 주소에 정렬·페이지 등 상태 파라미터가 여러 개 붙어, 같은 글이 수십 개 주소로 색인됩니다.",
    fix: "글 주소는 글 번호만으로 열리게 하고, 목록 상태값은 주소에서 빼 주세요.",
    detectorName: "URL·링크",
  },
  D5_URL_VARIANTS: {
    label: "한 문서에 주소 여러 개",
    what: "한 문서가 5개 이상의 서로 다른 주소로 발견됐습니다.",
    fix: "대표 주소를 정하고 canonical 태그를 넣어 주세요.",
    detectorName: "URL·링크",
  },
  D5_JSESSIONID: {
    label: "주소에 세션 ID",
    what: "링크 주소에 세션 ID가 노출됩니다.",
    fix: "URL 재작성(rewriting)을 끄고 쿠키만 쓰도록 설정해 주세요.",
    detectorName: "URL·링크",
  },
  D5_HTTP_LINK: {
    label: "내부 링크가 http",
    what: "내부 링크가 https가 아닌 http로 되어 있습니다.",
    fix: "링크를 https로 바꿔 주세요.",
    detectorName: "URL·링크",
  },
  D5_ORPHAN: {
    label: "어디서도 연결되지 않는 페이지",
    what: "사이트맵에는 있지만 어떤 페이지에서도 링크되지 않습니다.",
    fix: "메뉴에 연결하거나 보관 여부를 결정해 주세요.",
    detectorName: "URL·링크",
  },
  D6_ATTACHMENT_ONLY: {
    label: "핵심 정보가 첨부파일에만",
    what: "수수료·준비물 같은 핵심 안내가 본문에는 없고 HWP·PDF 첨부에만 있어, AI와 검색이 읽지 못합니다.",
    fix: "첨부의 핵심 내용을 본문 표로 옮겨 주세요. AI가 만든 구조화 초안을 참고하되 반드시 확인 후 게시하세요.",
    detectorName: "첨부 의존",
  },
  D6_SCANNED_PDF: {
    label: "스캔 PDF",
    what: "첨부 PDF가 이미지 스캔본이라 글자를 읽을 수 없습니다.",
    fix: "텍스트가 있는 PDF로 교체하거나 본문에 내용을 적어 주세요.",
    detectorName: "첨부 의존",
  },
  D7_CONFLICT_FEE: {
    label: "수수료가 페이지마다 다름",
    what: "같은 민원의 수수료가 페이지마다 다르게 적혀 있어, AI가 틀린 금액을 답할 수 있습니다.",
    fix: "정확한 금액을 확인하고 모든 페이지를 같은 값으로 맞춰 주세요.",
    detectorName: "사실 충돌",
  },
  D7_CONFLICT_PHONE: {
    label: "전화번호가 페이지마다 다름",
    what: "같은 업무의 문의 전화가 페이지마다 다르게 적혀 있습니다.",
    fix: "현재 담당 전화로 통일해 주세요.",
    detectorName: "사실 충돌",
  },
  D7_CONFLICT_HOURS: {
    label: "운영시간이 페이지마다 다름",
    what: "같은 시설·업무의 운영시간이 페이지마다 다릅니다.",
    fix: "현재 운영시간으로 통일해 주세요.",
    detectorName: "사실 충돌",
  },
  D7_CONFLICT_PERIOD: {
    label: "처리기간·기간 불일치",
    what: "같은 민원의 처리기간이나 신청 기간이 페이지마다 다릅니다.",
    fix: "정확한 기간으로 통일해 주세요.",
    detectorName: "사실 충돌",
  },
  D7_CONFLICT_OTHER: {
    label: "기타 사실 불일치",
    what: "같은 대상에 대한 값이 페이지마다 다릅니다.",
    fix: "정확한 값으로 통일해 주세요.",
    detectorName: "사실 충돌",
  },
  D8_RRN: {
    label: "주민등록번호 노출",
    what: "페이지 또는 첨부에 주민등록번호로 보이는 숫자가 노출돼 있습니다. 즉시 조치가 필요합니다.",
    fix: "해당 내용을 즉시 삭제·마스킹하고 개인정보 담당자에게 알려 주세요.",
    detectorName: "개인정보",
  },
  D8_FRN: {
    label: "외국인등록번호 노출",
    what: "외국인등록번호로 보이는 숫자가 노출돼 있습니다. 즉시 조치가 필요합니다.",
    fix: "해당 내용을 즉시 삭제·마스킹하고 개인정보 담당자에게 알려 주세요.",
    detectorName: "개인정보",
  },
  D8_MOBILE: {
    label: "개인 휴대전화 노출",
    what: "시민이 쓴 글이나 첨부에 개인 휴대전화 번호가 노출돼 있습니다.",
    fix: "번호를 마스킹하거나 삭제해 주세요.",
    detectorName: "개인정보",
  },
  D8_ACCOUNT: {
    label: "계좌번호 추정",
    what: "은행명 근처에 계좌번호로 보이는 숫자열이 있습니다(관찰 등급, 확인 필요).",
    fix: "개인 계좌라면 마스킹해 주세요. 기관 계좌면 무시해도 됩니다.",
    detectorName: "개인정보",
  },
  D8_EMAIL_CITIZEN: {
    label: "시민 이메일 노출",
    what: "시민이 쓴 글에 이메일 주소가 노출돼 있습니다.",
    fix: "이메일을 마스킹해 주세요.",
    detectorName: "개인정보",
  },
};

export const SEVERITY_LABEL: Record<string, string> = {
  critical: "긴급",
  high: "높음",
  medium: "보통",
  low: "낮음",
};

export const STATUS_LABEL: Record<string, string> = {
  open: "대기",
  approved: "승인",
  rejected: "반려",
  deferred: "보류",
  fixed: "해결됨",
  regressed: "재발",
};

export const DISPOSITION_LABEL: Record<string, string> = {
  update: "갱신 요청",
  retitle: "title 수정",
  redirect: "301 리다이렉트",
  archive: "보관 + 색인 제외",
  exclude_index: "색인만 제외",
  keep: "유지",
};

export const REJECT_REASONS = ["오탐(문제 아님)", "이미 조치됨", "의도된 구성", "기록물(보존 필요)", "기타"];
