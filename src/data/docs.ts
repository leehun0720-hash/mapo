import type { Cluster, Doc, PageType } from "@/lib/types";

// 시연용 표본 문서. 회귀 사례 F1~F9(구성명세서 11.1)를 재현하도록 구성했다.
// 실제 URL 패턴·게시물 번호는 설명용이다. 첫 크롤에서 확인한다.

type DocInput = Omit<
  Doc,
  "aliasUrls" | "breadcrumb" | "declaredCanonical" | "contactPhone" | "postedAt" | "latestDateInText" | "bodyLen" | "clusterId" | "lang" | "pageType"
> &
  DocExtra;
type DocExtra = {
  aliasUrls?: string[];
  breadcrumb?: string[];
  declaredCanonical?: string | null;
  contactPhone?: string | null;
  postedAt?: string | null;
  latestDateInText?: string | null;
  bodyLen?: number;
  clusterId?: number | null;
  lang?: string;
  pageType?: PageType;
};

const d = (p: DocInput): Doc => ({
  aliasUrls: [],
  breadcrumb: [],
  declaredCanonical: null,
  contactPhone: null,
  postedAt: null,
  latestDateInText: null,
  bodyLen: p.bodyExcerpt.length * 6,
  clusterId: null,
  lang: "ko",
  pageType: "content",
  ...p,
});

const PASSPORT_BODY =
  "여권 재발급은 유효기간 만료, 분실, 훼손, 사증란 부족 시 신청할 수 있습니다. 준비물: 여권용 사진 1매, 신분증, 기존 여권. 수수료: 10년 복수여권(58면) 53,000원, 5년 복수여권 45,000원. 처리기간은 접수일로부터 근무일 기준 4~5일입니다. 문의: 민원여권과 02-3153-8330";

const silverDocs: Doc[] = [
  "경로당 현황",
  "노인일자리 사업 안내",
  "장수수당 신청",
  "치매안심센터 안내",
  "어르신 무료급식",
  "실버 문화교실",
  "효도 목욕 서비스",
  "노인복지관 안내",
  "기초연금 안내",
  "노인 학대 신고",
  "경로우대 교통카드",
  "어르신 건강검진",
].map((h1, i) =>
  d({
    docId: 150 + i,
    siteId: 2,
    canonicalUrl: `https://silver.mapo.go.kr/site/silver/content/silver${String(i + 1).padStart(2, "0")}`,
    title: "마포구청 | 대표사이트",
    h1,
    breadcrumb: ["어르신 포털", h1],
    department: "복지정책과",
    bodyExcerpt: `${h1}에 대한 안내 페이지입니다. 대상, 신청 방법, 문의처를 안내합니다.`,
    contentSha256: `s${150 + i}`,
  }),
);

export const DOCS: Doc[] = [
  // F1 — 도메인 간 중복 (cluster 1)
  d({
    docId: 101,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/passport_reissue",
    aliasUrls: [
      "https://silver.mapo.go.kr/site/main/content/passport_reissue",
      "https://mangwon1.mapo.go.kr/site/main/content/passport_reissue",
      "https://culture.mapo.go.kr/site/main/content/passport_reissue",
      "https://edu.mapo.go.kr/site/main/content/passport_reissue",
    ],
    title: "여권 재발급 | 여권민원 | 마포구청",
    h1: "여권 재발급",
    breadcrumb: ["민원", "여권민원", "여권 재발급"],
    department: "민원여권과",
    contactPhone: "02-3153-8330",
    postedAt: "2026-03-02",
    bodyExcerpt: PASSPORT_BODY,
    contentSha256: "a1f3c9",
    clusterId: 1,
  }),
  ...[2, 3, 4, 5].map((siteId, i) =>
    d({
      docId: 102 + i,
      siteId,
      canonicalUrl: `https://${["silver", "mangwon1", "culture", "edu"][i]}.mapo.go.kr/site/main/content/passport_reissue`,
      title: "여권 재발급 | 여권민원 | 마포구청",
      h1: "여권 재발급",
      breadcrumb: ["민원", "여권민원", "여권 재발급"],
      department: "민원여권과",
      contactPhone: "02-3153-8330",
      postedAt: "2026-03-02",
      bodyExcerpt: PASSPORT_BODY,
      contentSha256: "a1f3c9",
      clusterId: 1,
    }),
  ),

  // F3 — "민원실 종합안내"로 색인
  d({
    docId: 110,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/minwon_housing",
    title: "민원실 종합안내 | 마포구청",
    h1: "주택/건축 민원",
    breadcrumb: ["민원", "주택/건축 민원"],
    department: "건축과",
    contactPhone: "02-3153-9520",
    bodyExcerpt:
      "건축허가, 건축신고, 건축물대장 발급·정정, 주택 임대사업자 등록 등 주택·건축 관련 민원의 처리 절차와 구비서류를 안내합니다.",
    contentSha256: "b2",
  }),
  d({
    docId: 111,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/dept_guide",
    title: "민원실 종합안내 | 마포구청",
    h1: "부서안내",
    breadcrumb: ["구청안내", "부서안내"],
    department: "총무과",
    bodyExcerpt: "마포구청 각 부서의 위치, 업무, 전화번호를 안내합니다. 2026년 8월 조직개편이 반영되었습니다.",
    contentSha256: "b3",
  }),

  // F4·F5 — 낡음
  d({
    docId: 120,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/covid19_route",
    title: "코로나19 확진자 이동경로 | 마포구청",
    h1: "코로나19 확진자 이동경로",
    breadcrumb: ["건강", "코로나19", "확진자 이동경로"],
    department: "보건행정과",
    contactPhone: "02-3153-9010",
    postedAt: "2021-08-14",
    latestDateInText: "2021-08-13",
    bodyExcerpt:
      "마포구 코로나19 확진자 이동경로를 안내합니다. 2021. 8. 13. 마포구 ○○번 확진자: 8. 11. 망원시장 방문, 8. 12. 선별진료소 검사. 거리두기 4단계 시행 중입니다.",
    contentSha256: "c1",
  }),
  d({
    docId: 121,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/vision8",
    title: "민선8기 구정 비전 | 마포구청",
    h1: "민선8기 구정 비전",
    breadcrumb: ["구청안내", "구정 비전"],
    department: "홍보담당관",
    postedAt: "2022-07-04",
    latestDateInText: "2026-06-30",
    bodyExcerpt:
      "민선8기(2022. 7. 1. ~ 2026. 6. 30.) 마포구의 구정 비전과 5대 목표, 핵심 공약을 소개합니다.",
    contentSha256: "c2",
  }),

  // F6 — 고시공고 이원화
  d({
    docId: 130,
    siteId: 1,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/gosi/58211",
    title: "마포구 고시 제2026-112호 도시계획시설(도로) 결정 고시 | 고시공고 | 마포구청",
    h1: "마포구 고시 제2026-112호 도시계획시설(도로) 결정 고시",
    breadcrumb: ["소식", "고시공고"],
    department: "도시계획과",
    postedAt: "2026-05-20",
    bodyExcerpt:
      "마포구 고시 제2026-112호. 「국토의 계획 및 이용에 관한 법률」 제30조에 따라 도시계획시설(도로) 결정을 다음과 같이 고시합니다. 위치: 마포구 성산동 일원.",
    contentSha256: "d1",
  }),
  d({
    docId: 131,
    siteId: 8,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/nPortal/gosi/view/58211",
    title: "마포구 고시 제2026-112호 도시계획시설(도로) 결정 고시 | 고시공고 | 마포구청",
    h1: "마포구 고시 제2026-112호 도시계획시설(도로) 결정 고시",
    breadcrumb: ["고시공고"],
    department: "도시계획과",
    postedAt: "2026-05-20",
    bodyExcerpt:
      "마포구 고시 제2026-112호. 「국토의 계획 및 이용에 관한 법률」 제30조에 따라 도시계획시설(도로) 결정을 다음과 같이 고시합니다. 위치: 마포구 성산동 일원.",
    contentSha256: "d1",
  }),
  d({
    docId: 132,
    siteId: 1,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/gosi/58340",
    title: "마포구 공고 제2026-870호 옥외광고물 정비 공고 | 고시공고 | 마포구청",
    h1: "마포구 공고 제2026-870호 옥외광고물 정비 공고",
    breadcrumb: ["소식", "고시공고"],
    department: "도시경관과",
    postedAt: "2026-06-11",
    bodyExcerpt: "정비 기간: 2026. 6. 15. ~ 2026. 7. 14. 대상: 홍대입구역 일대 불법 옥외광고물. 이행강제금 부과 예정.",
    contentSha256: "d2a",
  }),
  d({
    docId: 133,
    siteId: 8,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/nPortal/gosi/view/58340",
    title: "마포구 공고 제2026-870호 옥외광고물 정비 공고 | 고시공고 | 마포구청",
    h1: "마포구 공고 제2026-870호 옥외광고물 정비 공고",
    breadcrumb: ["고시공고"],
    department: "도시경관과",
    postedAt: "2026-06-11",
    bodyExcerpt: "정비 기간: 2026. 6. 15. ~ 2026. 7. 31. 대상: 홍대입구역 일대 불법 옥외광고물. 이행강제금 부과 예정. (정정: 기간 연장)",
    contentSha256: "d2b",
  }),
  d({
    docId: 134,
    siteId: 1,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/gosi/41022",
    title: "마포구 공고 제2023-455호 주민참여예산 위원 모집 | 고시공고 | 마포구청",
    h1: "마포구 공고 제2023-455호 주민참여예산 위원 모집",
    breadcrumb: ["소식", "고시공고"],
    department: "기획예산과",
    postedAt: "2023-06-02",
    bodyExcerpt: "주민참여예산위원회 위원을 모집합니다. 접수 기간 2023. 6. 5. ~ 6. 30.",
    contentSha256: "d3",
  }),

  // F9 — china·japan title 누락
  d({
    docId: 140,
    siteId: 6,
    canonicalUrl: "https://china.mapo.go.kr/site/china/content/about",
    title: null,
    h1: "麻浦区简介",
    breadcrumb: ["麻浦区简介"],
    department: "홍보담당관",
    bodyExcerpt: "麻浦区位于首尔特别市西北部，汉江北岸。人口约37万。",
    contentSha256: "e1",
    lang: "zh",
  }),
  d({
    docId: 141,
    siteId: 7,
    canonicalUrl: "https://japan.mapo.go.kr/site/japan/content/about",
    title: null,
    h1: "麻浦区の紹介",
    breadcrumb: ["麻浦区の紹介"],
    department: "홍보담당관",
    bodyExcerpt: "麻浦区はソウル特別市の北西部、漢江の北岸に位置しています。",
    contentSha256: "e2",
    lang: "ja",
  }),

  // F2 — 하위 도메인 title 동일
  ...silverDocs,

  // D7 — 사실 충돌
  d({
    docId: 170,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/passport_fee",
    title: "여권 수수료 안내 | 여권민원 | 마포구청",
    h1: "여권 수수료 안내",
    breadcrumb: ["민원", "여권민원", "여권 수수료 안내"],
    department: "민원여권과",
    contactPhone: "02-3153-8330",
    postedAt: "2026-01-15",
    bodyExcerpt: "10년 복수여권(58면) 53,000원, 10년 복수여권(26면) 50,000원, 5년 복수여권(58면) 45,000원, 단수여권 20,000원.",
    contentSha256: "f1",
  }),
  d({
    docId: 171,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/minwon_fee_all",
    title: "민원 수수료 총괄표 | 민원 | 마포구청",
    h1: "민원 수수료 총괄표",
    breadcrumb: ["민원", "민원 수수료 총괄표"],
    department: "민원여권과",
    postedAt: "2024-02-20",
    bodyExcerpt: "여권 재발급(10년 복수, 58면) 5만원. 주민등록등본 400원. 건축물대장 등본 500원. 인감증명 600원.",
    contentSha256: "f2",
  }),
  d({
    docId: 172,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/building_register",
    title: "건축물대장 발급 | 주택/건축 민원 | 마포구청",
    h1: "건축물대장 발급",
    breadcrumb: ["민원", "주택/건축 민원", "건축물대장 발급"],
    department: "건축과",
    contactPhone: "02-3153-9530",
    postedAt: "2026-08-20",
    bodyExcerpt: "건축물대장 등본 발급 수수료 500원(1통). 문의: 건축과 02-3153-9530.",
    contentSha256: "f3",
  }),
  d({
    docId: 173,
    siteId: 3,
    canonicalUrl: "https://mangwon1.mapo.go.kr/site/mangwon1/content/minwon",
    title: "동 민원 안내 | 망원1동",
    h1: "동 민원 안내",
    breadcrumb: ["망원1동", "동 민원 안내"],
    department: "망원1동",
    contactPhone: "02-3153-6700",
    postedAt: "2023-11-02",
    bodyExcerpt: "건축물대장 발급은 구청 건축과(02-3153-9412)로 문의하세요. 주민등록등본은 동 주민센터에서 400원.",
    contentSha256: "f4",
  }),

  // D8 — 개인정보
  d({
    docId: 180,
    siteId: 1,
    pageType: "citizen_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/free/99231",
    title: "자유게시판 | 마포구청",
    h1: "가로등 고장 신고합니다",
    breadcrumb: ["참여", "자유게시판"],
    department: "디지털정책팀",
    postedAt: "2026-09-14",
    bodyExcerpt: "망원동 ○○길 가로등이 3일째 꺼져 있습니다. 연락 주세요. 010-****-**** (마스킹본)",
    contentSha256: "g1",
  }),
  d({
    docId: 181,
    siteId: 1,
    pageType: "board_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/notice/77120",
    title: "2026년 하반기 기간제근로자 채용 합격자 공고 | 공지사항 | 마포구청",
    h1: "2026년 하반기 기간제근로자 채용 합격자 공고",
    breadcrumb: ["소식", "공지사항"],
    department: "총무과",
    postedAt: "2026-09-10",
    bodyExcerpt: "합격자 명단은 첨부파일을 확인하세요. (첨부 hwpx 안에 응시번호·성명·생년월일 표 포함)",
    contentSha256: "g2",
  }),
  d({
    docId: 182,
    siteId: 1,
    pageType: "citizen_post",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/free/99102",
    title: "자유게시판 | 마포구청",
    h1: "환급 문의드립니다",
    breadcrumb: ["참여", "자유게시판"],
    department: "디지털정책팀",
    postedAt: "2026-09-08",
    bodyExcerpt: "과오납 환급을 국민은행 123-**-****** 계좌로 부탁드립니다. (마스킹본)",
    contentSha256: "g3",
  }),

  // D5 — 링크·URL
  d({
    docId: 190,
    siteId: 4,
    canonicalUrl: "https://culture.mapo.go.kr/site/culture/content/festival2026",
    title: "2026 마포 문화축제 | 문화관광",
    h1: "2026 마포 문화축제",
    breadcrumb: ["축제", "2026 마포 문화축제"],
    department: "문화예술과",
    postedAt: "2026-05-02",
    bodyExcerpt: "프로그램 안내와 신청은 아래 링크를 참고하세요. 신청 바로가기, 프로그램 안내(PDF), 오시는 길.",
    contentSha256: "h1",
  }),
  d({
    docId: 191,
    siteId: 5,
    canonicalUrl: "https://edu.mapo.go.kr/site/edu/content/scholarship",
    title: "마포 장학금 안내 | 교육포털",
    h1: "마포 장학금 안내",
    breadcrumb: ["교육지원", "장학금"],
    department: "교육청소년과",
    postedAt: "2026-02-10",
    bodyExcerpt: "장학금 신청은 마포장학재단 홈페이지에서 진행합니다. 신청 바로가기.",
    contentSha256: "h2",
  }),
  d({
    docId: 196,
    siteId: 1,
    pageType: "board_list",
    canonicalUrl: "https://www.mapo.go.kr/site/main/board/gosi",
    title: "고시공고 | 마포구청",
    h1: "고시공고",
    breadcrumb: ["소식", "고시공고"],
    department: "디지털정책팀",
    bodyExcerpt: "(목록 페이지) 고시공고 목록. 2023-07-19 이전 게시글.",
    contentSha256: "h3",
  }),
  d({
    docId: 197,
    siteId: 8,
    pageType: "board_list",
    canonicalUrl: "https://www.mapo.go.kr/nPortal/gosi",
    title: "고시공고 | 마포구청",
    h1: "고시공고",
    breadcrumb: ["고시공고"],
    department: "디지털정책팀",
    bodyExcerpt: "(목록 페이지) nPortal 고시공고 목록.",
    contentSha256: "h4",
  }),

  // D6 — 첨부 의존
  d({
    docId: 200,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/passport_docs",
    title: "여권 발급 준비물 | 여권민원 | 마포구청",
    h1: "여권 발급 준비물",
    breadcrumb: ["민원", "여권민원", "여권 발급 준비물"],
    department: "민원여권과",
    postedAt: "2025-12-01",
    bodyExcerpt: "여권 발급에 필요한 서류와 수수료는 첨부파일(여권발급안내.hwp)을 확인하세요.",
    bodyLen: 62,
    contentSha256: "i1",
  }),

  // D1 near dup
  d({
    docId: 201,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/waste_schedule",
    title: "생활쓰레기 배출 요일 | 청소 | 마포구청",
    h1: "생활쓰레기 배출 요일",
    breadcrumb: ["생활", "청소", "생활쓰레기 배출 요일"],
    department: "청소행정과",
    postedAt: "2026-04-01",
    bodyExcerpt: "생활쓰레기는 일·화·목요일 저녁 8시 이후 배출합니다. 음식물쓰레기는 매일 배출 가능합니다.",
    contentSha256: "j1",
    clusterId: 2,
  }),
  d({
    docId: 202,
    siteId: 3,
    canonicalUrl: "https://mangwon1.mapo.go.kr/site/mangwon1/content/waste",
    title: "쓰레기 배출 안내 | 망원1동",
    h1: "쓰레기 배출 안내",
    breadcrumb: ["망원1동", "쓰레기 배출 안내"],
    department: "망원1동",
    postedAt: "2025-03-11",
    bodyExcerpt: "생활쓰레기는 일·화·목요일 저녁 8시 이후에 배출하세요. 음식물쓰레기는 매일 배출할 수 있습니다.",
    contentSha256: "j2",
    clusterId: 2,
  }),

  // D3 조직 불일치·검토
  d({
    docId: 210,
    siteId: 1,
    canonicalUrl: "https://www.mapo.go.kr/site/main/content/smart_city",
    title: "스마트도시 서비스 | 마포구청",
    h1: "스마트도시 서비스",
    breadcrumb: ["구정", "스마트도시 서비스"],
    department: "스마트정보과",
    contactPhone: "02-3153-8560",
    postedAt: "2025-02-18",
    bodyExcerpt: "마포구 스마트도시 서비스(스마트 가로등, 공공 와이파이)를 안내합니다. 문의: 스마트정보과 02-3153-8560",
    contentSha256: "k1",
  }),
  d({
    docId: 211,
    siteId: 4,
    canonicalUrl: "https://culture.mapo.go.kr/site/culture/content/tour_course_old",
    title: "마포 도보 관광코스 | 문화관광",
    h1: "마포 도보 관광코스",
    breadcrumb: ["관광", "도보 관광코스"],
    department: "문화예술과",
    postedAt: "2019-05-20",
    latestDateInText: "2019-04-30",
    bodyExcerpt: "2019년 새로 단장한 경의선숲길 코스와 홍대 걷고싶은거리 코스를 소개합니다. 관련 링크 5개 중 2개가 열리지 않습니다.",
    contentSha256: "k2",
  }),
];

export const CLUSTERS: Cluster[] = [
  {
    clusterId: 1,
    kind: "exact",
    canonicalDocId: 101,
    canonicalRule: "① owner_path_prefixes(/site/main/)에 속하는 대표 도메인 URL",
    docIds: [101, 102, 103, 104, 105],
  },
  {
    clusterId: 2,
    kind: "near",
    canonicalDocId: 201,
    canonicalRule: "② site.priority (main=1 < mangwon1=60)",
    docIds: [201, 202],
    jaccard: 0.91,
  },
];

export const docById = (id: number | null | undefined) => (id == null ? undefined : DOCS.find((x) => x.docId === id));
export const clusterById = (id: number | null | undefined) =>
  id == null ? undefined : CLUSTERS.find((c) => c.clusterId === id);
